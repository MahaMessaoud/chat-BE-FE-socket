import { Component } from '@angular/core';
import { RestaurantService } from 'src/services/restau.service';

@Component({
  selector: 'app-add-resto',
  templateUrl: './add-resto.component.html',
  styleUrls: ['./add-resto.component.scss']
})
export class AddRestoComponent {
  newResto = { name: '', location: '', cuisine: '' };

  constructor(private restoService: RestaurantService) {}

  addResto() {
    if (this.newResto.name && this.newResto.location && this.newResto.cuisine) {
      this.restoService.addRestaurant(this.newResto).subscribe(() => {
        this.newResto = { name: '', location: '', cuisine: '' };
      });
    }
  }
}
