import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RestaurantService } from 'src/services/restau.service';

@Component({
  selector: 'app-update-resto',
  templateUrl: './update-resto.component.html',
  styleUrls: ['./update-resto.component.scss'],
})
export class UpdateRestoComponent {
  selectedResto: any = { name: '', location: '', cuisine: '' };
  id!: string;  // Stocke l'ID du restaurant

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private restoService: RestaurantService
  ) {}

  ngOnInit(): void {
    // 🔥 Récupérer l'ID depuis l'URL
    this.id = this.route.snapshot.paramMap.get('id')!; // Le "!" assure que l'ID n'est pas null

    if (this.id) {
      // 🔥 Charger les données du restaurant
      this.restoService.getRestaurantById(this.id).subscribe((data: any) => {
        this.selectedResto = data;
      });
    }
  }

  updateResto() {
    if (this.selectedResto) {
      // 🔥 Envoyer la mise à jour à l'API
      this.restoService.updateRestaurant(this.id, this.selectedResto)
        .subscribe(() => {
          console.log('✅ Restaurant mis à jour avec succès');
          this.router.navigate(['/restaurants']);  // ✅ Redirection après l'update
        });
    }
  }

  cancelUpdate() {
    this.router.navigate(['/restaurants']);  // ✅ Bouton "Annuler" -> Retour à la liste
  }

}
