import 'zone.js/dist/zone-node';

import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import { join } from 'path';
import * as compression from 'compression';

import { AppServerModule } from './src/main.server';
import { APP_BASE_HREF } from '@angular/common';
import { existsSync } from 'fs';
import * as cache from 'memory-cache';

const serverCache = new cache.Cache();

  
// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  server.use(compression());

  const distFolder = join(process.cwd(), 'dist/testUniversal/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
  server.engine('html', ngExpressEngine({
    bootstrap: AppServerModule,
    inlineCriticalCss: false
  }));

  server.set('view engine', 'html');
  server.set('views', distFolder);

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Universal engine
  server.get('*', cacheMiddleware(300), (req, res) => {
    res.render(indexHtml, { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }] }, 
      (err: any, html: any) => {
        if (err) {
            return console.log(err);
        }

        if (html) {
          const baseUrl = req.protocol + '://' + req.get('host');
          const fullUrl = baseUrl + req.originalUrl;
          html = setMetaData(html, 'Angular Description', 'Angular Description', fullUrl, 'http://localhost:4200/assets/img/universal_logo.png');
          res.send(html);
        }
    });
  });

  return server;
}

 //duration in seconds.
 const cacheMiddleware = (duration: number) => {
  return (req: any, res: any, next: Function) => {
    let key = '__express__' + req.originalUrl || req.url;
    let cachedBody = serverCache.get(key);
    if (cachedBody) {
      res.send(cachedBody);
      return
    } else {
      res.sendResponse = res.send;
      res.send = (body: any) => { 
        serverCache.put(key, body, duration * 1000);
        res.sendResponse(body);
      }
      next();
    }
  }
}

function setMetaData(
  html: string,
  title: string,
  description: string,
  url: string,
  imageUrl: string
): string {
  html = html.replace(/\$TITLE/g, title);
  html = html.replace(/\$OG_TITLE/g, title);
  html = html.replace(/\$DESCRIPTION/g, description);
  html = html.replace(/\$OG_DESCRIPTION/g, description);
  html = html.replace(/\$OG_URL/g, url);
  html = html.replace(/\$OG_IMAGE/g, imageUrl);
  return html;
}

function run(): void {
  const port = process.env.PORT || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export * from './src/main.server';