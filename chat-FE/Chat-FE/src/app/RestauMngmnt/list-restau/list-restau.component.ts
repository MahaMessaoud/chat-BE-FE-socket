import { RestaurantService } from 'src/services/restau.service';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-restau',
  templateUrl: './list-restau.component.html',
  styleUrls: ['./list-restau.component.scss']
})

export class ListRestauComponent {
  restaurants: any[] = [];
  selectedResto: any = null;

  constructor(private restoService: RestaurantService) {}

  ngOnInit(): void {
    this.restoService.getRestaurants().subscribe((data: any) => {
      this.restaurants = data;
    });

    this.restoService.onRestaurantAdded().subscribe((newResto: any) => {
      this.restaurants.push(newResto);
    });

    // Écouter la mise à jour en temps réel
  this.restoService.onRestaurantUpdated().subscribe((updatedResto: any) => {
    const index = this.restaurants.findIndex(r => r._id === updatedResto._id);
    if (index !== -1) {
      this.restaurants[index] = updatedResto;
    }
  });

  // Écouter la suppression en temps réel
  this.restoService.onRestaurantDeleted().subscribe((deletedId: any) => {
    this.restaurants = this.restaurants.filter(r => r._id !== deletedId);
  });
  }

  deleteResto(id: string) {
    this.restoService.deleteRestaurant(id).subscribe();
  }

  editResto(resto: any) {
    this.selectedResto = { ...resto }; // Copie de l'objet pour éviter la modification directe
  }
}
