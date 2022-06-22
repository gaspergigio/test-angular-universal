import { isPlatformServer } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ApiService } from '../../utils/services/api-service.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private isServer: boolean;
  constructor(private api: ApiService, @Inject(PLATFORM_ID) platformId: Object, private title: Title,
  private meta: Meta) {
    this.isServer = isPlatformServer(platformId);
  }

  ngOnInit(): void {
    this.title.setTitle("Angular Title");
    this.meta.addTag({ name: 'description', content: 'Angular Description' });
    this.meta.addTag({ property: 'og:title', content: 'Angular Title' });
    this.meta.addTag({ property: 'og:description', content: 'Angular Description' });
    this.meta.addTag({ property: 'og:url', content: 'http://localhost:4200/blog/5' });
    this.meta.addTag({ property: 'og:image', content: 'http://localhost:4200/assets/img/universal_logo.png' });

    this.api.getUsers().subscribe(res => {
      if (this.isServer)
        console.log("Home: ", res);
    });
  }

}
