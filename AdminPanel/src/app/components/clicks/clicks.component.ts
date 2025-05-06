import { Component, OnInit } from '@angular/core';
import { Card } from 'src/app/interfaces/card.model';
import { CardService } from 'src/app/services/card.service';

@Component({
  selector: 'app-clicks',
  templateUrl: './clicks.component.html',
  styleUrls: ['./clicks.component.css']
})
export class ClicksComponent implements OnInit {

  requests: Card[] = [];
  loading:boolean = true;
  
  constructor(private cardService: CardService) {}

  ngOnInit(): void {
    this.cardService.signIn();
    this.fetchClicks(); 
  }

  async fetchClicks() {
    try {
      this.cardService.getClicks();
    } catch( error) {
      console.log(error);
    } 
  }
}
