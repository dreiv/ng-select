import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ConnectionPositionPair, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class SelectComponent implements OnInit {
  @Input() model: any;
  @Input() labelKey = 'label';
  @Input() idKey = 'id';
  @Input() options = [];

  @Output() selectChange = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  searchControl = new FormControl();

  private overlayRef: OverlayRef;
  private originalOptions = [];

  constructor(
    private overlay: Overlay
  ) { }

  get isOpen() {
    return true;
  }

  ngOnInit(): void {
    this.originalOptions = [...this.options];

    if (this.model !== undefined) {
      this.model = this.options.find(
        currentOption => currentOption[this.idKey] === this.model
      );
    }
  }

  get label() {
    return this.model ? this.model[this.labelKey] : 'Select...';
  }

  isActive(option: any) {
    if (!this.model) {
      return false;
    }

    return option[this.idKey] === this.model[this.idKey];
  }

  search(value: string): void {
    this.options = this.originalOptions.filter(
      option => (option[this.labelKey] as any[]).includes(value)
    );
  }

  select(option: any): void {
    this.model = option;
    this.selectChange.emit(option[this.idKey]);
  }

}
