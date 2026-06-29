import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RoomService } from '../../../services/room.service';
import { switchMap, tap } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { Room } from '../../../model/room';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-room-dialog',
  imports: [
    MatDialogModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatSelectModule
  ],
  templateUrl: './room-dialog.component.html',
  styleUrl: './room-dialog.component.css',
  providers: [{provide: DateAdapter, useClass: NativeDateAdapter}]
})
export class RoomDialogComponent {
  private readonly roomService = inject(RoomService);
  private readonly data = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<RoomDialogComponent>);
  
  protected $form = signal(new FormGroup({
    idRoom: new FormControl<number>(this.data?.idRoom || null),
    number: new FormControl<string>(this.data?.number || '',[Validators.required]),
    type: new FormControl<string>(this.data?.type || '',[Validators.required, Validators.minLength(3)]),
    price: new FormControl<number>(this.data?.price || 0, [Validators.required, Validators.min(1)]),
    available: new FormControl<boolean>(this.data?.available === 'true', [Validators.required]),
  }));

  protected $isEdit = computed(() => this.$form().value.idRoom > 0);
  protected $f = computed(() => this.$form().controls);

  operate(){
    if(this.$form().invalid)return;

    const room: Room = this.$form().value as Room;
    const isEdit =  this.$isEdit();
    const msg = isEdit ? 'UPDATED' : 'CREATED';
    const operation$ = isEdit ? this.roomService.update(room.idRoom, room) : this.roomService.save(room); 

    operation$.pipe(
      switchMap(() => this.roomService.findAll()),
      tap(data => this.roomService.setListChange(data)),
      tap( () => this.roomService.setMessageChange(msg))
    )
    .subscribe(() => this.close());
  }

  close(){
    this.dialogRef.close();
  }
}
