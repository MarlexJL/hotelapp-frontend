import { Routes } from '@angular/router';
import { RoomComponent } from './pages/room/room.component';
import { RoomDialogComponent } from './pages/room/room-dialog/room-dialog.component';
import { ReservationComponent } from './pages/reservation/reservation.component';

export const routes: Routes = [
  {
    path: 'pages/room', component: RoomComponent,
    children: [
      { path: 'new', component: RoomDialogComponent },
      { path: 'edit/:id', component: RoomDialogComponent },
    ],
  },
  { path: 'pages/reservation', component: ReservationComponent },
];
