import { Component, OnInit } from '@angular/core';
import { Card } from 'src/app/interfaces/card.model';
import { CardService } from 'src/app/services/card.service';


@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.css']
})
export class RequestComponent implements OnInit {

  requests: Card[] = [];
  loading:boolean = true;
  
  constructor(private cardService: CardService) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.fetchRequests(); 
      this.loading = false;
    },1000);
  }

  async fetchRequests() {
    try {
      this.requests = await this.cardService.getRequests();
    } catch( error) {
      console.log(error);
    } 
  }
}

// adaugare subiect??
