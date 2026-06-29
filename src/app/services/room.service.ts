import { Injectable } from '@angular/core';
import { GenericSignalService } from './generic-signal.service';
import { Room } from '../model/room';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class RoomService extends GenericSignalService<Room> {
  protected override url = `${environment.HOST}/v1/rooms`;

  findAllAvailableRooms(){
    return this.http.get<Room[]>(`${this.url}/available`);
  }
}
