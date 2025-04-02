import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SpaceXMission, MissionDetails } from '../models/spacex.interface';

@Injectable({
  providedIn: 'root'
})
export class SpacexService {
  private baseUrl = 'https://api.spacexdata.com/v3';

  constructor(private http: HttpClient) { }

  getAllMissions(): Observable<SpaceXMission[]> {
    return this.http.get<SpaceXMission[]>(`${this.baseUrl}/launches`);
  }

  getMissionsByYear(year: string): Observable<SpaceXMission[]> {
    return this.http.get<SpaceXMission[]>(`${this.baseUrl}/launches?launch_year=${year}`);
  }

  getMissionDetails(flightNumber: number): Observable<MissionDetails> {
    return this.http.get<MissionDetails>(`${this.baseUrl}/launches/${flightNumber}`);
  }
}
