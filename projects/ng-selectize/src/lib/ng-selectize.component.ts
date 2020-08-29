import {
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  DoCheck,
  forwardRef,
  Component,
  Output,
  Renderer2,
  EventEmitter,
  IterableDiffers,
  IterableDiffer,
  IterableChangeRecord,
  IterableChanges,
  OnDestroy,
  ElementRef,
  ViewChild
} from '@angular/core';

import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  FormControl
} from '@angular/forms';

declare const $: any;

export const SELECTIZE_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => NgSelectizeComponent),
  multi: true
};

// tslint:disable-next-line:no-conflicting-lifecycle
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ng-selectize',
  template: `<select #selectizeInput></select>`,
  providers: [SELECTIZE_VALUE_ACCESSOR]
})
export class NgSelectizeComponent implements OnInit, OnChanges, DoCheck, ControlValueAccessor, OnDestroy {

  @Input() config: any;
  // tslint:disable-next-line:variable-name
  private _options: any[];
  // tslint:disable-next-line:variable-name
  private _options_differ: IterableDiffer<any>;
  // tslint:disable-next-line:variable-name
  private _optgroups: any[];
  // tslint:disable-next-line:variable-name
  private _optgroups_differ: IterableDiffer<any>;

  @Input() id: string;
  @Input() placeholder: string;
  @Input() hasOptionsPlaceholder: string;
  @Input() noOptionsPlaceholder: string;
  @Input() enabled = true;
  @Input() value: string[];
  @Input() formControl: FormControl;
  @Input() errorClass: string;

  // tslint:disable-next-line:no-output-on-prefix
  @Output() onBlur: EventEmitter<void> = new EventEmitter<void>(false);

  @ViewChild('selectizeInput', { static: true }) selectizeInput: ElementRef;

  private selectize: any;

  @Input()
  set options(value: any[]) {
    this._options = value;
    if (!this._options_differ && value) {
      this._options_differ = this._differs.find(value).create();
    }
  }

  get options(): any[] {
    return this._options;
  }

  @Input()
  set optgroups(value: any[]) {
    this._optgroups = value;
    if (!this._optgroups_differ && value) {
      this._optgroups_differ = this._differs.find(value).create();
    }
  }

  get optgroups(): any[] {
    return this._optgroups;
  }

  // Control value accessors.
  private onTouchedCallback: () => {};
  private onChangeCallback: (_: any) => {};

  // tslint:disable-next-line: variable-name
  constructor(private _differs: IterableDiffers, private renderer: Renderer2) {
  }

  ngOnInit() {
    if (this.id && this.id.length > 0) {
      this.renderer.setAttribute(this.selectizeInput.nativeElement, 'id', this.id);
    }
    this.reset();
  }

  reset() {
    this.selectize = $(this.selectizeInput.nativeElement).selectize(this.config)[0].selectize;
    this.selectize.on('change', this.onSelectizeValueChange.bind(this));
    this.selectize.on('blur', this.onBlurEvent.bind(this));

    this.updatePlaceholder();
    this.onEnabledStatusChange();
  }

  // Change detection for primitive types.
  ngOnChanges(changes: SimpleChanges) {
    if (this.selectize) {
      if (changes.hasOwnProperty('placeholder') || changes.hasOwnProperty('hasOptionsPlaceholder')
        || changes.hasOwnProperty('noOptionsPlaceholder')) {
        this.updatePlaceholder();
      }
      if (changes.hasOwnProperty('enabled')) {
        this.onEnabledStatusChange();
      }
    }
  }

  // Implementing deep check for option comparison
  // FIXME -> Implement deep check to only compare against label and value fields.
  ngDoCheck() {
    if (this._options_differ) {
      const changes = this._options_differ.diff(this._options);
      if (changes) {
        this._applyOptionsChanges(changes);
      }
    }
    if (this._optgroups_differ) {
      const changes = this._optgroups_differ.diff(this._optgroups);
      if (changes) {
        this._applyOptionGroupChanges(changes);
      }
    }
  }

  private _applyOptionsChanges(changes: IterableChanges<any>): void {
    changes.forEachAddedItem((record: IterableChangeRecord<any>) => {
      this.onSelectizeOptionAdd(record.item);
    });
    changes.forEachRemovedItem((record: IterableChangeRecord<any>) => {
      this.onSelectizeOptionRemove(record.item);
    });
    this.updatePlaceholder();
    this.evalHasError();
  }

  private _applyOptionGroupChanges(changes: any): void {
    changes.forEachAddedItem((record: IterableChangeRecord<any>) => {
      this.onSelectizeOptGroupAdd(record.item);
    });
    changes.forEachRemovedItem((record: IterableChangeRecord<any>) => {
      this.onSelectizeOptGroupRemove(record.item);
    });
    this.updatePlaceholder();
    this.evalHasError();
  }

  onBlurEvent() {
    if (this.formControl) {
      this.formControl.markAsTouched();
    }
    this.onBlur.emit();
    this.evalHasError();
  }

  onSelectizeOptGroupAdd(optgroup: any): void {
    this.selectize.addOptionGroup(optgroup[this.getOptgroupField()], optgroup);
  }

  onSelectizeOptGroupRemove(optgroup: any): void {
    this.selectize.removeOptionGroup(optgroup[this.getOptgroupField()]);
  }

  // Refresh selected values when options change.
  onSelectizeOptionAdd(option: any): void {
    this.selectize.addOption($.extend({}, true, option));
    const valueField = this.getValueField();
    if (this.value) {
      const items = (typeof this.value === 'string' || typeof this.value === 'number') ? [this.value] : this.value;
      if (items && items instanceof Array && items.find(value => value === option[valueField])) {
        this.selectize.addItem(option[valueField], true);
      }
    }
  }

  onSelectizeOptionRemove(option: any): void {
    this.selectize.removeOption(option[this.getValueField()]);
  }

  evalHasError() {
    const parent = $(this.selectize.$control).parent();
    if (this.formControl) {
      if (this.formControl.touched && this.formControl.invalid) {
        parent.addClass(this.errorClass || 'has-error');
      } else if (parent.hasClass('has-error')) {
        parent.removeClass(this.errorClass || 'has-error');
      }
    }
  }

  // Update the current placeholder based on the given input parameter.
  updatePlaceholder(): void {
    if (this.selectize.items.length === 0 && this.selectize.settings.placeholder !== this.getPlaceholder()) {
      this.selectize.settings.placeholder = this.getPlaceholder();
      this.selectize.updatePlaceholder();
      this.selectize.showInput(); // Without this, when options are cleared placeholder only appears after focus.
    }
  }

  // Called when a change is detected in the 'enabled' input field.
  // Sets the selectize state based on the new value.
  onEnabledStatusChange(): void {
    this.enabled ? this.selectize.enable() : this.selectize.disable();
  }

  // Dispatches change event when a value change is detected.
  onSelectizeValueChange(): void {
    // In some cases this gets called before registerOnChange.
    if (this.onChangeCallback) {
      this.onChangeCallback(this.selectize.getValue());
    }
  }

  // Returns the applicable placeholder.
  getPlaceholder(): string {
    if (this.hasOptionsPlaceholder) {
      if (this.options && this.options.length > 0) {
        return this.hasOptionsPlaceholder;
      }
    }
    if (this.noOptionsPlaceholder) {
      if (!this.options || this.options.length === 0) {
        return this.noOptionsPlaceholder;
      }
    }
    return this.placeholder;
  }

  writeValue(obj: any): void {
    if (obj !== this.value) {
      this.value = obj;
    }
    if (this.selectize) {
      this.selectize.setValue(this.value);
    }
  }

  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedCallback = fn;
  }

  getValueField(): string {
    return this.config.valueField ? this.config.valueField : 'value';
  }

  getOptgroupField(): string {
    return this.config.optgroupField ? this.config.optgroupField : 'optgroup';
  }

  private destroyMemory() {
    if (this._optgroups) {
      this._optgroups = [];
    }
    if (this._options) {
      this._options = [];
    }
    if (this.selectize) {
      delete this.selectize;
    }
    if (this.selectizeInput) {
      delete this.selectizeInput;
    }
    if (this._differs) {
      delete this._differs;
    }
    if (this.formControl) {
      delete this.formControl;
    }
    if (this.renderer) {
      delete this.renderer;
    }
    if (this.config) {
      delete this.config;
    }
  }

  // onDestroy memory component
  ngOnDestroy() {
    if (this.selectize) {
      this.selectize.destroy();
      this.destroyMemory();
    }
  }
}
