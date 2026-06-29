import { Component, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { switchMap, tap } from 'rxjs';
import { ReservationService } from '../../services/reservation.service';
import { Reservation } from '../../model/reservation';
import { ReservationDialogComponent } from './reservation-dialog/reservation-dialog.component';
import { RoomService } from '../../services/room.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-reservation',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
  ],
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.css',
})
export class ReservationComponent {
  private readonly reservationService = inject(ReservationService);
  private readonly roomService = inject(RoomService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected $dataSource = signal(new MatTableDataSource<Reservation>());
  protected displayedColumns: string[] = ['idReservation', 'customerName', 'checkInDate', 'checkOutDate', 'idRoom', 'actions'];
  protected $reservations = this.reservationService.$listChange;
  protected $rooms = toSignal(this.roomService.findAll(), { initialValue: [] });

  protected $paginator = viewChild(MatPaginator);
  protected $sort = viewChild(MatSort);

  constructor() {
    this.reservationService.findAll().subscribe(data => this.reservationService.setListChange(data));
    this.initializeEffects();
  }

  private initializeEffects() {
    effect(() => {
      const data = this.$reservations();
      const p = this.$paginator();
      const s = this.$sort();

      const ds = this.$dataSource();
      ds.data = data;
      ds.paginator = p;
      ds.sort = s;
    });

    effect(() => {
      const message = this.reservationService.$messageChange();
      if (message) {
        this.snackBar.open(message, 'INFO', { duration: 2000, horizontalPosition: 'right', verticalPosition: 'top' });
        untracked(() => this.reservationService.setMessageChange(''));
      }
    });
  }

  applyFilter(e: Event) {
    const filterValue = (e.target as HTMLInputElement).value;
    this.$dataSource().filter = filterValue.trim().toLowerCase();
  }

  openDialog(reservation?: Reservation) {
    this.dialog.open(ReservationDialogComponent, {
      width: '650px',
      data: reservation,
    });
  }

  delete(id: number) {
    this.reservationService.delete(id).pipe(
      switchMap(() => this.reservationService.findAll()),
      tap(data => this.reservationService.setListChange(data)),
      tap(() => this.reservationService.setMessageChange('DELETED'))
    ).subscribe();
  }

  getRoomNumber(idRoom: number) {
    const room = this.$rooms().find(r => r.idRoom === idRoom);
    return room ? room.number + ' - ' + room.type : 'N/A';
  }
}
