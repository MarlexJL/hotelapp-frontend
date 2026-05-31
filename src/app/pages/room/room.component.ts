import { Component, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RoomService } from '../../services/room.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Room } from '../../model/room';
import { RoomDialogComponent } from './room-dialog/room-dialog.component';

@Component({
  selector: 'app-room',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule
  ],
  templateUrl: './room.component.html',
  styleUrl: './room.component.css',
})
export class RoomComponent {
  private readonly roomService = inject(RoomService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected $dataSource = signal(new MatTableDataSource<Room>());
  protected displayedColumns: string[] = ['idRoom', 'number', 'type','price','available', 'actions'];
  protected $rooms = this.roomService.$listChange;

  protected $paginator = viewChild(MatPaginator);
  protected $sort = viewChild(MatSort);

  constructor() {
    this.roomService.findAll().subscribe(data => this.roomService.setListChange(data));

    this.initializeEffects();
    
  }

  private initializeEffects(){
    effect(() => {
      const data = this.$rooms();
      const p = this.$paginator();
      const s = this.$sort();

      const ds = this.$dataSource();
      ds.data = data;
      ds.paginator = p;
      ds.sort = s;
    });

    effect(() => {
      const message = this.roomService.$messageChange();
      if (message) {
        this.snackBar.open(message, 'INFO', { duration: 2000, horizontalPosition: 'right', verticalPosition: 'top' });
        untracked(() => this.roomService.setMessageChange(''));
      }
    });  
  }

  applyFilter(e: Event){
   const filterValue = (e.target as HTMLInputElement).value;
   this.$dataSource().filter = filterValue.trim().toLowerCase();
  }

  openDialog(room?: Room){
    this.dialog.open(RoomDialogComponent, {
      width: '650px',
      data: room,
      //disableClose: true
    });
  }
}
