import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  ViewContainerRef,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {
  ConnectionPositionPair,
  Overlay,
  OverlayRef,
  FlexibleConnectedPositionStrategy
} from '@angular/cdk/overlay';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';
import { TemplatePortal } from '@angular/cdk/portal';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class SelectComponent implements OnInit, OnDestroy {
  @Input() model: any;
  @Input() labelKey = 'label';
  @Input() idKey = 'id';
  @Input() options = [];
  @Input() optionTpl: TemplateRef<any>;

  @Output() selectChange = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  @ViewChild('origin') origin: HTMLButtonElement;
  @ViewChild('dropdown') dropdown: TemplateRef<any>;

  visibleOptions = 4;

  searchControl = new FormControl();

  private unsubscribe$: Subject<void>;
  private overlayRef: OverlayRef | null;
  private originalOptions = [];

  constructor(private vcr: ViewContainerRef, private overlay: Overlay) {}

  get isOpen(): boolean {
    return true;
  }

  get label(): any {
    return this.model ? this.model[this.labelKey] : 'Select...';
  }

  ngOnInit(): void {
    this.originalOptions = [...this.options];

    if (this.model !== undefined) {
      this.model = this.options.find(
        (currentOption) => currentOption[this.idKey] === this.model
      );
    }

    this.searchControl.valueChanges
      .pipe(takeUntil(this.unsubscribe$), debounceTime(300))
      .subscribe((term) => this.search(term));
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
  }

  open(): void {
    if (this.overlay) {
      this.close();
    }

    this.overlayRef = this.overlay.create({
      width: this.origin.offsetWidth,
      maxHeight: this.visibleOptions * 32,
      backdropClass: '',
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      positionStrategy: this.getOverlayPosition()
    });

    const template = new TemplatePortal(this.dropdown, this.vcr);
    this.overlayRef.attach(template);
  }

  private close(): void {
    this.overlayRef?.detach();
    this.overlayRef = null;
  }

  isActive(option: any): boolean {
    if (!this.model) {
      return false;
    }

    return option[this.idKey] === this.model[this.idKey];
  }

  search(value: string): void {
    this.options = this.originalOptions.filter((option) =>
      (option[this.labelKey] as any[]).includes(value)
    );
  }

  select(option: any): void {
    this.model = option;
    this.selectChange.emit(option[this.idKey]);
  }

  private getOverlayPosition(): FlexibleConnectedPositionStrategy {
    const positions = [
      new ConnectionPositionPair(
        { originX: 'start', originY: 'bottom' },
        { overlayX: 'start', overlayY: 'top' }
      ),
      new ConnectionPositionPair(
        { originX: 'start', originY: 'top' },
        { overlayX: 'start', overlayY: 'bottom' }
      )
    ];

    return this.overlay
      .position()
      .flexibleConnectedTo(this.origin)
      .withPositions(positions)
      .withFlexibleDimensions(false)
      .withPush(false);
  }
}
