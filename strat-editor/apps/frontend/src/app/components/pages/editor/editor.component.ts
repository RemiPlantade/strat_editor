import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import {
  Agent,
  Floor,
  Map,
  Image,
  DrawerColor,
  DrawingMode,
  Strat,
  UserInfos,
  NotificationType,
  DrawerAction,
  PolyLineAction,
} from '@strat-editor/data';
import * as Actions from '@strat-editor/store';
import * as Selectors from '@strat-editor/store';
import { StratEditorState } from '@strat-editor/store';
import { DrawingEditorComponent } from '@strat-editor/drawing-editor';
import { KEY_CODE } from '../../../helpers/key_code';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { StratSavingDialogComponent } from '../../molecules/strat-saving-dialog/strat-saving-dialog.component';
import { map } from 'rxjs/operators';
import { NotificationService } from '@strat-editor/services';

@Component({
  selector: 'strat-editor-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements OnInit, AfterViewInit {
  @ViewChild('drawerEditor') drawerEditor: DrawingEditorComponent;

  public $maps: Observable<Map[]>;
  public selectedMap: Map;
  public selectedFloor: Floor;
  public userInfos: UserInfos;

  public width: number = 0;
  public height: number = 0;
  private canvasStateLoading: boolean;
  private draggingAgent: Agent;
  private draggingImage: Image;

  private CTRLPressed: boolean;
  public editingStrat: Strat;

  public $drawingMode: Observable<DrawingMode>;
  public $strat: Observable<Strat>;

  constructor(
    private store: Store<StratEditorState>,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.$maps = this.store.select(Selectors.getAllMaps);
    this.$drawingMode = this.store.select(Selectors.getDrawingMode);
    this.store.dispatch(Actions.FetchMaps());
    this.store.dispatch(Actions.FetchAgents());
    this.store.dispatch(Actions.FetchDrawerActions());
    this.store.dispatch(Actions.FetchFontNames());
    this.store.dispatch(Actions.SetColor({ color: new DrawerColor() }));
    this.store.dispatch(
      Actions.SetDrawerAction({ action: new PolyLineAction() })
    );
  }

  ngAfterViewInit(): void {
    this.store.select(Selectors.getSelectedAction).subscribe((selected) => {
      if (this.selectedFloor) {
        this.store.dispatch(Actions.closeRight());
      }
    });
    this.store.select(Selectors.getDraggedAgent).subscribe((agent) => {
      if (agent) {
        this.draggingAgent = agent;
      }
    });
    this.store.select(Selectors.getDraggedImage).subscribe((image) => {
      if (image) {
        this.draggingImage = image;
      }
    });
    this.store.select(Selectors.getSelectedMap).subscribe((map) => {
      // TODO Ask to save the strat before leave
      this.selectedMap = map;
      this.store.dispatch(
        Actions.SelectFloor({ floor: map ? map.floors[0] : null })
      );
    });

    this.store.select(Selectors.getSelectedFloor).subscribe((floor) => {
      this.selectedFloor = floor;
    });

    this.store.select(Selectors.getUserInfos).subscribe((userInfos) => {
      this.userInfos = userInfos;
    });

    this.store.select(Selectors.getEditingStrat).subscribe((editingStrat) => {
      this.editingStrat = editingStrat;
      if (editingStrat) {
        if (editingStrat.layers[0]) {
          this.store
            .select(Selectors.getAllMaps)
            .pipe(
              map((maps) => maps.find((map) => map._id === editingStrat.mapId))
            )
            .subscribe((map) => {
              this.store.dispatch(Actions.SelectMap({ map }));

              this.store.dispatch(
                Actions.SelectFloor({
                  floor: map.floors.find(
                    (floor) => floor._id === editingStrat.layers[0]?.floorId
                  ),
                })
              );
              const canvasState = JSON.stringify(
                editingStrat.layers[0]?.fabricCanvas
              );
              this.store.dispatch(Actions.SaveCanvasState({ canvasState }));
            });
        } else {
          this.notificationService.displayNotification({
            message: 'Cannot load this strat',
            type: NotificationType.error,
          });
        }
      }
    });
  }

  onMapSelected(map: Map) {
    this.store.dispatch(Actions.SelectMap({ map: map }));
  }

  onFloorSelected(floor: Floor) {
    this.store.dispatch(Actions.SelectFloor({ floor: floor }));
  }

  onDrawingActionSelected(action: DrawerAction) {
    this.store.dispatch(Actions.SetDrawerAction({ action }));
    this.store.dispatch(Actions.closeRight());
  }

  onCanvasStateModified(state: string) {
    const canvasState = JSON.stringify(state);
    this.store.dispatch(Actions.SaveCanvasState({ canvasState }));
  }

  onCanvasStateLoaded() {
    this.canvasStateLoading = false;
  }

  onDrawingModeChanged(drawingMode: DrawingMode) {
    this.store.dispatch(Actions.SetDrawingMode({ drawingMode }));
  }

  @HostListener('document:keyup', ['$event'])
  keyUp(event: KeyboardEvent) {
    switch (event.key.toLocaleLowerCase()) {
      case KEY_CODE.DELETE:
        this.drawerEditor.deleteActiveObject();
        break;
      case KEY_CODE.ESCAPE:
        this.drawerEditor.resetView();
        break;
      case KEY_CODE.A:
        if (this.CTRLPressed) {
          this.drawerEditor.selectAllObjects();
          if (window.getSelection) {
            if (window.getSelection().empty) {
              window.getSelection().empty();
            } else if (window.getSelection().removeAllRanges) {
              window.getSelection().removeAllRanges();
            }
          }
        }
        break;
      case KEY_CODE.Z:
        if (this.CTRLPressed && !this.canvasStateLoading) {
          this.store.dispatch(Actions.UndoCanvasState());
        }
        break;
      case KEY_CODE.Y:
        if (this.CTRLPressed && !this.canvasStateLoading) {
          this.store.dispatch(Actions.RedoCanvasState());
        }
        break;
      case KEY_CODE.CTRL:
        this.CTRLPressed = false;
        break;
      default:
    }
  }

  @HostListener('document:keydown', ['$event'])
  keyDown(event: KeyboardEvent) {
    switch (event.key.toLocaleLowerCase()) {
      case KEY_CODE.CTRL:
        this.CTRLPressed = true;
        break;
    }
  }

  @HostListener('dragstart', ['$event'])
  onWindowDragStart(event: any) {
    this.cdr.detach();
  }

  @HostListener('dragend', ['$event'])
  onWindowDragEnd(event: any) {
    this.cdr.reattach();
  }

  @HostListener('drop', ['$event'])
  onwindowDrop(event: any) {
    event.preventDefault();
    event.stopPropagation();
    if (this.draggingAgent) {
      this.drawerEditor.drawAgent(
        this.draggingAgent,
        event.layerX,
        event.layerY
      );
      this.draggingAgent = null;
    }
    if (this.draggingImage) {
      this.drawerEditor.drawImage(
        this.draggingImage,
        event.layerX,
        event.layerY
      );
      this.draggingImage = null;
    }
  }

  openAgentsPanel() {
    this.store.dispatch(Actions.showAgentsPanel());
  }

  openGadgetsPanel() {
    this.store.dispatch(Actions.showGadgetsPanel());
  }

  openDrawingPanel() {
    this.store.dispatch(Actions.showDrawingPanel());
  }

  openGalleryPanel() {
    this.store.dispatch(Actions.showGalleryPanel());
  }

  public onSelect() {
    this.drawerEditor.enableSelectionMode();
  }

  public onDrag() {
    this.drawerEditor.enableDraggingMode();
  }

  public onDraw() {
    this.drawerEditor.enableDrawMode();
  }

  public onSave() {
    console.log('this.editingStrat', this.editingStrat);
    if (this.editingStrat) {
      if (this.editingStrat._id) {
        this.store.dispatch(Actions.UpdateStrat({ strat: this.editingStrat }));
      } else {
        this.store.dispatch(Actions.UploadStrat({ strat: this.editingStrat }));
      }
    } else {
      console.log('opening save dialog', this.userInfos);

      const strat: Strat = {
        createdAt: new Date(),
        name: `${this.selectedMap.name} - ${new Date().toLocaleDateString()}`,
        description: '',
        lastModifiedAt: new Date(),
        createdBy: this.userInfos?.userId,
        votes: 0,
        layers: [],
        mapId: this.selectedMap._id,
        mapName: this.selectedMap.name,
        isPublic: false,
      };
      const dialogRef = this.dialog.open(StratSavingDialogComponent, {
        width: '400px',
        hasBackdrop: true,
        data: { strat },
        panelClass: ['strat-saving-dialog'],
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((strat) => {
        if (strat) {
          this.store.dispatch(Actions.UploadStrat({ strat }));
        }
      });
    }
  }

  public onShowInfos() {}

  public onOpenStrat() {}

  public onDeleteStrat() {}

  public stopWheelEvent($event) {
    $event.preventDefault();
    $event.stopPropagation();
  }
}
