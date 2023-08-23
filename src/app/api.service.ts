import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });

  getTimeslots() {
    return this.http
      .get('http://localhost:8000/api/timeslots')
      .pipe(map((data: any) => data.data.timeSlots));
  }

  createTimeslot(body: any) {
    return this.http.post('http://localhost:8000/api/timeslots', body);
  }

  getTimeslot(id: string) {
    return this.http
      .get(`http://localhost:8000/api/timeslots/${id}`)
      .pipe(map((data: any) => data.data.timeSlot));
  }

  updateTimeslot(id: string, body: any) {
    return this.http.put(`http://localhost:8000/api/timeslots/${id}`, body);
  }

  deleteTimeslot(id: string) {
    return this.http.delete(`http://localhost:8000/api/timeslots/${id}`).pipe(
      tap((data) => console.log(data)),
      map((data: any) => data)
    );
  }
}
