import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RoomService } from '../../../services/room.service';
import { switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-room-dialog',
  imports: [
    MatDialogModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './room-dialog.component.html',
  styleUrl: './room-dialog.component.css',
})
export class RoomDialogComponent {
  private readonly roomService = inject(RoomService);
  private readonly data = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<RoomDialogComponent>);
  
  protected $room = signal({ ... this.data });

  operate(){
    const room = this.$room();
    const isEdit = room != null && room.idRoom > 0;
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
