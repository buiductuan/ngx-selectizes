# ngx-selectizes

[![npm version](https://badge.fury.io/js/ng-selectize.svg)](https://badge.fury.io/js/ng-selectize)

Angular 10 is available component for [selectize.js]

## Including within existing angular-cli project
1. `npm i --save ngx-selectizes jquery selectize`
2. Add the following to the styles array within `.angular.json`:
	```javascript
    "../node_modules/selectize/dist/css/selectize.css",
    "../node_modules/selectize/dist/css/selectize.{your chosen theme}.css"
    ```
3. Add the following to the scripts array within `.angular.json`
	```javascript
	"../node_modules/jquery/dist/jquery.min.js",
	"../node_modules/ngx-selectizes/selectize/selectize.standalone.js" (or take from /node_modules/selectize/...)
	```
3. Import module within applicable `@NgModule`:
	```javascript
	import {NgSelectizeModule} from 'ngx-selectizes';
	imports: [..., NgSelectizeModule, ...],
	```
4. Use within template: `<ng-selectize [config]="..." [options] = "..." {other-attributes}></ng-selectize>`

## Docs
The docs directory within this repo is the result of `ng build --prod` from the [ng-selectize-demo](https://github.com/buiductuan/ngx-selectizes.git) repository. It can be accessed from the hosted example site above.

## Attributes
| Attribute | Type | Default | Description | Implemented |
| --- | --- | --- | --- | --- |
| config | Object | null | Selectize config | Yes |
| options | Array | null | Available options to select from | Yes |
| placeholder | String | '' | Placeholder text to be displayed. Is overridden if hasOptionsPlaceholder/noOptionsPlaceholder are non-null | Yes |
| noOptionsPlaceholder | String | '' | Placeholder text to be displayed when no options are available | Yes |
| hasOptionsPlaceholder | String | '' | Placeholder text to be displayed when options are available | Yes |
| enabled | Boolean | true | Enables the input field when true, disabled otherwise | Yes |
| formControl | FormControl | null | Form control field to be used to set value and/or validation. | Yes |
| errorClass | String | 'has-error' | CSS Class to be added to the field when  | Yes |
| optionGroups | Object | null | Organize options within groups | Yes |

## Included Selectize Plugins
| Name | Options | Description |
| --- | --- | --- |
| dropdown_direction | {'auto', 'up', 'down'} | Control the direction in which the dropdown opens. |
