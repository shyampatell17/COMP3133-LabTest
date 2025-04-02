import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SpacexService } from '../../services/spacex.service';
import { MissionDetails } from '../../models/spacex.interface';

@Component({
  selector: 'app-missiondetails',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './missiondetails.component.html',
  styleUrls: ['./missiondetails.component.css']
})
export class MissiondetailsComponent implements OnInit {
  mission: MissionDetails | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private spacexService: SpacexService
  ) { }

  ngOnInit(): void {
    const flightNumber = this.route.snapshot.paramMap.get('id');
    if (flightNumber) {
      this.loadMissionDetails(Number(flightNumber));
    }
  }

  loadMissionDetails(flightNumber: number): void {
    this.spacexService.getMissionDetails(flightNumber).subscribe(
      (data) => {
        this.mission = data;
      },
      (error) => {
        console.error('Error fetching mission details:', error);
      }
    );
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
