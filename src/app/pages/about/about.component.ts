import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { ApiService } from 'src/app/utils/services/api-service.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  private isBrowser: boolean;
  constructor(private api: ApiService, @Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.api.getUsers().subscribe(res => {
      if(this.isBrowser)
        console.log("about: ", res);
    })
  }

}
