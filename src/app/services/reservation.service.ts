import { Injectable } from '@angular/core';
import { GenericSignalService } from './generic-signal.service';
import { Reservation } from '../model/reservation';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ReservationService extends GenericSignalService<Reservation> {
  protected override url = `${environment.HOST}/v1/reservations`;
}
