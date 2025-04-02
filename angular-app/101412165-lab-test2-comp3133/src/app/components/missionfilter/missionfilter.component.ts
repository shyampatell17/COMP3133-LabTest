import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-missionfilter',
  standalone: true,
  imports: [CommonModule, MatButtonToggleModule, MatCardModule],
  templateUrl: './missionfilter.component.html',
  styleUrls: ['./missionfilter.component.css']
})
export class MissionfilterComponent {
  @Output() yearSelected = new EventEmitter<string>();

  years: string[] = [
    '2006', '2007', '2008', '2009', '2010',
    '2011', '2012', '2013', '2014', '2015',
    '2016', '2017', '2018', '2019', '2020'
  ];

  onYearChange(year: string): void {
    this.yearSelected.emit(year);
  }

  clearFilter(): void {
    this.yearSelected.emit('');
  }
}
