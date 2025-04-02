import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { SpacexService } from '../../services/spacex.service';
import { SpaceXMission } from '../../models/spacex.interface';
import { MissionfilterComponent } from '../missionfilter/missionfilter.component';

@Component({
  selector: 'app-missionlist',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MissionfilterComponent],
  templateUrl: './missionlist.component.html',
  styleUrls: ['./missionlist.component.css']
})
export class MissionlistComponent implements OnInit {
  missions: SpaceXMission[] = [];

  constructor(
    private spacexService: SpacexService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadMissions();
  }

  loadMissions(): void {
    this.spacexService.getAllMissions().subscribe(
      (data) => {
        this.missions = data;
      },
      (error) => {
        console.error('Error fetching missions:', error);
      }
    );
  }

  onYearFilter(year: string): void {
    if (year) {
      this.spacexService.getMissionsByYear(year).subscribe(
        (data) => {
          this.missions = data;
        },
        (error) => {
          console.error('Error fetching missions by year:', error);
        }
      );
    } else {
      this.loadMissions();
    }
  }

  viewMissionDetails(flightNumber: number): void {
    this.router.navigate(['/mission', flightNumber]);
  }
}
