import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { switchMap, tap } from 'rxjs';
import { ReservationService } from '../../../services/reservation.service';
import { Reservation } from '../../../model/reservation';
import { MatSelectModule } from '@angular/material/select';
import { RoomService } from '../../../services/room.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { format } from 'date-fns';

@Component({
  selector: 'app-reservation-dialog',
  imports: [
    MatDialogModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatDatepickerModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './reservation-dialog.component.html',
  styleUrl: './reservation-dialog.component.css',
})
export class ReservationDialogComponent {
  private readonly reservationService = inject(ReservationService);
  private readonly roomService = inject(RoomService);
  private readonly data = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ReservationDialogComponent>);

  protected $form = signal(new FormGroup({
    idReservation: new FormControl<number>(this.data?.idReservation || null),
    customerName: new FormControl<string>(this.data?.customerName || '', [Validators.required, Validators.minLength(3)]),
    idRoom: new FormControl<number>(this.data?.idRoom || null, [Validators.required, Validators.min(1)]),
    checkInDate: new FormControl<string>(this.data?.checkInDate || '', [Validators.required]),
    checkOutDate: new FormControl<string>(this.data?.checkOutDate || '', [Validators.required]),
  }));

  protected $rooms = toSignal(this.roomService.findAll(), { initialValue: [] });
  protected $isEdit = computed(() => this.$form().value.idReservation > 0);
  protected $f = computed(() => this.$form().controls);

  protected $minDate = signal(new Date());

  private formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  operate() {
    if (this.$form().invalid) return;

    const formValue = this.$form().value;
    const isEdit = this.$isEdit();
    const reservation: Reservation = {
      ...formValue,
      idReservation: isEdit ? formValue.idReservation : null,
      checkInDate: format(formValue.checkInDate, "yyyy-MM-dd'T'HH:mm:ss"),
      checkOutDate: format(formValue.checkOutDate, "yyyy-MM-dd'T'HH:mm:ss")
    } as Reservation;
    const msg = isEdit ? 'UPDATED' : 'CREATED';
    const operation$ = isEdit
      ? this.reservationService.update(reservation.idReservation, reservation)
      : this.reservationService.save(reservation);

    operation$.pipe(
      switchMap(() => this.reservationService.findAll()),
      tap(data => this.reservationService.setListChange(data)),
      tap(() => this.reservationService.setMessageChange(msg))
    ).subscribe(() => this.close());
  }

  close() {
    this.dialogRef.close();
  }
}
