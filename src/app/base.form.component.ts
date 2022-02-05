import { FormGroup } from "@angular/forms";

export abstract class BaseFormComponent {
  form!: FormGroup;

  // retrieve a FormControl
  getControl(name: string) {
    return this.form.get(name);
  }

  // returns TRUE if the FormControl is valid
  isValid(name: string) {
    const control = this.getControl(name);
    return control && control.valid;
  }

  // returns TRUE if the FormControl has been changed
  isChanged(name: string) {
    const control = this.getControl(name);
    return control && (control.dirty || control.touched);
  }

  // returns TRUE if the FormControl is raising an error,
  // i.e. an invalid state after user changes
  hasError(name: string) {
    const control = this.getControl(name);
    return control && (control.dirty || control.touched) && control.invalid;
  }
}
