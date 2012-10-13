/**
* opts = {
* Common ->
* id: Id of the control
* required/req: mark control as required
* text: text to be displayed in corresponding label
* displayExp: Expression to decide hide/show
*
* text* ->
* mask: Regular Expression validating content
* noLabel: Hide label (not passing text would work too)
* minVal/maxVal: indicate valid range
*
* label ->
* labelFor: the for target of label control
* labelText: text to be displayed for label
*
* radio ->
* menuItems: the group of radio buttons
*
* menu ->
* menuItems: the options for the select menu
* 
* menuItem ->
* value: value returned by the item
* text: text displayed for the item
*
* group ->
* controls: controls to be rendered in the group
*
* control ->
* type: type of control
* opts: options for the control
* }
**/

/*
'Email Validation Regular Expression

'"\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*"

'Is valid  phone number
'((\(\d{3}\) ?)|(\d{3}-))?\d{3}-\d{4}


'U.S Social Security Nummer
'\d{3}-\d{2}-\d{4}

'U.S Zip Code
'\d{5}(-\d{4})?

'U.S Tax Id Validation
'(\d{2}(-\d{7})|(\d{3}-\d{2}-\d{4})
'Federal Tax ID : Format: XX-XXXXXXX or XXX-XX-XXXX

'Integer 
' ^[0-9]*$

'Date mm/dd/yyyy
'"^\d{2}[\/-]\d{2}[\/-]\d{2,4}$

'^\d{2}[\]\d{2}[\]\d{4}$
*/

var DECIMAL_REGEX = "^\\s*(\\+|-)?((\\d+(\\.\\d+)?)|(\\.\\d+))\\s*$";
var INTEGER_REGEX = "^[0-9]*$";
var PERCENTAGE_REGEX = "^-?[0-9]{0,2}(\\.[0-9]{1,2})?$|^-?(100)(\\.[0]{1,2})?$";
var EMAIL_REGEX = "\\w+([-+.']\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*";
var PHONE_REGEX = "\\w+([-+.']\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*";
var TIN_REGEX = "(\\d{2}(-\\d{7})|(\\d{3}-\\d{2}-\\d{4})";
var CURRENCY_REGEX = "^\\$?([1-9]{1}[0-9]{0,2}(\\,[0-9]{3})*(\\.[0-9]{0,2})?|[1-9]{1}[0-9]{0,}(\\.[0-9]{0,2})?|0(\\.[0-9]{0,2})?|(\\.[0-9]{1,2})?)$";

var DEFAULT_VALIDATION_MESSAGE = "Please enter proper input.";
var DEFAULT_REQUIRED_MESSAGE = "This field is required.";

var displayExpressions = [];
var controlDictionary = [];

///Wrapping Function
function getControl(type, opts) {
    switch (type) {
        case "text":
            return getText(opts);
        case "label":
            return getLabel(opts);
        case "date":
            return getDate(opts);
        case "decimal":
            return getDecimal(opts);
        case "integer":
            return getInteger(opts);
        case "percentage":
            return getPercentage(opts);
        case "email":
            return getEmail(opts);
        case "phone":
            return getPhone(opts);
        case "tin":
            return getTin(opts);
        case "currency":
            return getCurrency(opts);
        case "checkbox":
            return getCheckbox(opts);
        case "radioMenu":
            return getRadioMenu(opts);
        case "menu":
            return getSelectMenu(opts);
        case "group":
            return getGroup(opts);
        case "section":
            return getSection(opts);
        case "page":
            return getPage(opts);
        default:
            return $('<span />').html("Invalid Control");
    }
}

function validate() {
    $('.validationError').remove();
    var isValid = true;
    $('.control:visible').each(function () {
        $this = $(this);
        var cntrlValid = true;
        //This if/else structure allows ordering of validations
        if ($this.hasClass('required')) {
            cntrlValid = cntrlValid && checkRequired.call(this);
        }
        if ($this.hasClass('date')) {
            cntrlValid = cntrlValid && checkDate.call(this);
        }
        if ($this.hasClass('decimal') || $this.hasClass('percentage') || $this.hasClass('email') || $this.hasClass('currency')) {
            cntrlValid = cntrlValid && checkType.call(this, $this.data('typeregex'));
        }
        if ($this.hasClass('masked')) {
            cntrlValid = cntrlValid && checkMask.call(this);
        }
        if ($this.hasClass('ranged')) {
            cntrlValid = cntrlValid && checkRange.call(this);
        }

        isValid = isValid && cntrlValid;
    });
    return isValid;
}

/************************************* Basic HTML Control emitters *************************************/
function getTextBox(opts) {
    var control = $("<input />").attr({ type: 'text', id: opts.id }).addClass("control");
    if (opts.mask) {
        control.attr({ 'data-mask': opts.mask, 'data-validationmsg': opts.validationMsg }).addClass('masked');
    }
    if (opts.minVal || opts.maxVal) {
        control.attr({ 'data-minval': opts.minVal, 'data-maxval': opts.maxVal }).addClass('ranged');
    }
    if (opts.required || opts.req) {
        control = markRequired.call(control, opts);
    }
    if (opts.text && !opts.noLabel) {
        control = control.before(getLabel({ labelFor: opts.id, id: "LBL_" + opts.id, labelText: opts.text }));
    }
    if (opts.displayExp) {
        displayExpressions = displayExpressions.concat({ id: opts.id, exp: opts.displayExp });
    }
    registerControl(control);
    return control;
}

function getSelectMenu(opts) {
    var control = $("<select />").attr({ id: opts.id, name: opts.id }).addClass("control");
    var options = opts.menuItems;
    $(options).each(function () {
        control.append(getSelectOption({ text: this.text, value: this.value }));
    });
    registerControl(control);
    return control;
}

function getSelectOption(opts) {
    return $('<option />').attr({ value: opts.value }).html(opts.text);
}

function getRadio(opts) {
    var control =  $("<input />")
                    .attr({ type: 'radio', id: opts.id, name: opts.radioGroup, value: opts.id })
                    .addClass('control radio')
                    .after(getLabel({ labelFor: opts.id, id: "LBL_" + opts.id, labelText: opts.text }));
    registerControl(control);
    return opts.checked ? control.attr({ checked: 'checked' }) : control;
}

function getCheckbox(opts) {
    var control = $("<input />")
                    .attr({ type: 'checkbox', id: opts.id, value: opts.id })
                    .addClass('control checkbox')
                    .after(getLabel({ labelFor: opts.id, id: "LBL_" + opts.id, labelText: opts.text }));
    registerControl(control);
    return opts.checked ? control.attr({ checked: 'checked' }) : control;
}

function getLabel(opts) {
    return $("<label />").attr({ 'for': opts.labelFor, id: opts.id }).html(opts.labelText);
}

/************************************* Derived Control emitters *************************************/
function getText(opts) {
    var control = getTextBox(opts);
    control.filter('.control').addClass('text');
    return control;
}

function getDecimal(opts) {
    var control = getTextBox(opts);
    control.filter('.control')
        .addClass('decimal')
        .attr({ 'data-typeregex': DECIMAL_REGEX });
    return control;
}

function getInteger(opts) {
    var control = getTextBox(opts);
    control.filter('.control')
        .addClass('integer')
        .attr({ 'data-typeregex': INTEGER_REGEX });
    return control;
}

function getPercentage(opts) {
    var control = getTextBox(opts);
    control.filter('.control')
        .addClass('percentage')
        .attr({ 'data-typeregex': PERCENTAGE_REGEX });
    return control;
}

function getEmail(opts) {
    var control = getTextBox(opts);
    control.filter('.control')
        .addClass('email')
        .attr({ 'data-typeregex': EMAIL_REGEX });
    return control;
}

function getPhone(opts) {
    var control = getTextBox(opts);
    control.filter('.control')
        .addClass('phone')
        .attr({ 'data-typeregex': PHONE_REGEX });
    return control;
}

function getTin(opts) {
    var control = getTextBox(opts);
    control.filter('.control')
        .addClass('tin')
        .attr({ 'data-typeregex': TIN_REGEX });
    return control;
}

function getCurrency(opts) {
    var control = getTextBox(opts);
    control.filter('.control')
        .addClass('currency')
        .attr({ 'data-typeregex': CURRENCY_REGEX });
    return control;
}

function getDate(opts) {
    var control = getTextBox(opts);
    control.filter('.control').addClass('date');
    return control;
}

function getMenu(opts) {
    return getSelectMenu(opts);
}

function getRadioMenu(opts) {
    var control = $('<span />');
    var radios = opts.menuItems;
    $(radios).each(function () {
        control.append(getRadio({ text: this.text, radioGroup: opts.id, id: this.id, checked: this.checked }));
    });
    return control;
}

function getGroup(opts) {
    var control = $('<div />').addClass('group').attr({ id: opts.id });
    var controls = opts.controls;
    if (opts.displayExp) {
        displayExpressions = displayExpressions.concat({ id: opts.id, exp: opts.displayExp });
    }
    $(controls).each(function () {
        this.opts = this.opts || {};
        //        this.opts['displayExp'] = opts.displayExp;
        this.opts['root'] = opts.root;
        control.append(getControl(this.type, this.opts)).append('<br />');
    });
    return control;
}

function getSection(opts) {

}
function getPage(opts) {
    var method = opts.method || 'post';
    var action = opts.action || '/';
    var control = $('<form />').addClass('page').attr({ id: opts.id, action: action, method: method });
    var controls = opts.controls;

    $(controls).each(function () {
        this.opts = this.opts || {};
        this.opts['root'] = control;
        control.append(getControl(this.type, this.opts)).append('<br />');
    });

    var submit = $('<input />').attr({ type: 'submit', value: opts.submitLabel || 'Submit', id: 'SUB_' + opts.id });   //type="submit" value="Submit" id="submitMyForm" />');
    control = control.append(submit);
    control.submit(validate);
    return control;
}

/************************************* Custom Validation *************************************/
function checkRequired() {
    var isValid = true;
    var $this = $(this)
    if (isMaskValid($this.val(), /^\s*$/)) {
        isValid = false;
        valMsg = false || DEFAULT_REQUIRED_MESSAGE;
        $this.after(getErrorMsg(valMsg));
    }
    return isValid;
}

function checkMask() {
    var isValid = true;
    var $this = $(this);
    if ($this.val() != '' && !isMaskValid($this.val(), $this.data('mask'))) {
        isValid = false;
        valMsg = $this.data('validationmsg') || DEFAULT_VALIDATION_MESSAGE;
        $this.after(getErrorMsg(valMsg));
    }
    return isValid;
}

function checkType(regex) {
    var isValid = true;
    var $this = $(this);
    if ($this.val() != '' && !isMaskValid($this.val(), regex)) {
        isValid = false;
        valMsg = $this.data('validationmsg') || DEFAULT_VALIDATION_MESSAGE;
        $this.after(getErrorMsg(valMsg));
    }
    return isValid;
}

function checkDate() {
    var isValid = true;
    var $this = $(this);
    if ($this.val() != '' && !isValidDate($this.val())) {
        isValid = false;
        valMsg = $this.data('validationmsg') || DEFAULT_VALIDATION_MESSAGE;
        $this.after(getErrorMsg(valMsg));
    }
    return isValid;
}

function checkRange() {
    var isValid = true;
    var $this = $(this);
    var min = $this.data('minval') || Number.MIN_VALUE;
    var max = $this.data('maxval') || Number.MAX_VALUE;
    if ($this.val() != '' && !isInRange($this.val(), min, max)) {
        isValid = false;
        valMsg = $this.data('validationmsg') || DEFAULT_VALIDATION_MESSAGE;
        $this.after(getErrorMsg(valMsg));
    }
    return isValid;
}

/************************************* Util and Eval Functions *************************************/
//Regex Mask
function isMaskValid(value, mask) {
    return new RegExp(mask).test(value);
}

//Date Field
///http://stackoverflow.com/questions/1353684/detecting-an-invalid-date-date-instance-in-javascript
function isValidDate(d) {
    return Object.prototype.toString.call(d) !== "[object Date]" ? false : !isNaN(d.getTime());
}

function markRequired(opts) {
    var reqIndicator = $("<span />").attr({ 'class': 'requiredIndicator' }).html('*');
    return $(this).addClass('required').after(reqIndicator);
}

function getErrorMsg(msg) {
    return $("<span />").addClass("validationError").html(msg);
}

function isInRange(val, min, max) {
    return val >= min && val <= max;
}

function initializeDisplayExpressions() {
//    initControlsDisplay();
    registerControlEvents();
}

function initControlsDisplay() {
    $(displayExpressions).each(function () {
        if (!eval(this.exp)) {
            $('#' + this.id).hide();
        }
    });
}

function registerControlEvents() {
    $(displayExpressions).each(function () {

        var targetId = this.id;

        var tree = getExpressionTree(this.exp);

        var controlNodesVault = getLeftLeaves(tree);

        var treeCopy = cloneTree(tree);

        var controlNodes = getLeftLeaves(treeCopy);

        var exp;

        for (i = 0; i < controlNodes.length; i++) {

            var op = controlNodes[i].op;

            var controlInfo = controlDictionary[op] || getControlInfoByName(op);

            switch (controlInfo.tag.toLowerCase()) {
                case 'select':
                    controlNodes[i].op = '$("#' + controlNodes[i].op + '").val()';
                    break;
                case 'input':
                    controlNodes[i].op = '$("input[name=' + controlNodes[i].op + ']:checked").val()';
                    break;
                default:
                    controlNodes[i].op = '$("' + '#' + controlNodes[i].op + '").val()';
            }
        }

        exp = getExpressionFromTree(treeCopy);

        for (i = 0; i < controlNodesVault.length; i++) {
            var nodeId = getExpressionFromTree(controlNodesVault[i]);

            var op = controlNodesVault[i].op;

            var controlInfo = controlDictionary[op] || getControlInfoByName(op);

            switch (controlInfo.tag.toLowerCase()) {
                case 'select':
                    registerChangeEventById(nodeId, targetId, exp);
                    break;
                case 'input':
                    switch (controlInfo.type.toLowerCase()) {
                        case "radio":
                            registerChangeEventByName(nodeId, targetId, exp);
                            break;
                        case "checkbox":
                            registerChangeEventById(nodeId, targetId, exp);
                            break;
                        default:

                    }
                    break;
                default:
                    controlNodes[i].op = '$("' + '#' + controlNodes[i].op + '").val()';
            }
            if (!eval(exp)) {
                $('#' + this.id).hide();
            }
        }

    }); 
}

function registerControl(control) {
    $(control).each(function () {
        controlDictionary[$(this).attr('id')] = { tag: $(this).get(0).tagName, type: $(this).attr('type'), name: $(this).attr('name') };
    });
}

function registerChangeEventByName(controlName, targetId, exp) {
    var target = $('#' + targetId);
    $('input[name=' + controlName + ']').change(function () {
        if (eval(exp)) {
            target.show();
        }
        else {
            target.hide();
        }
    });
}

function registerChangeEventById(controlId, targetId, exp) {
    var target = $('#' + targetId);
    $('#' + controlId).change(function () {
        if (eval(exp)) {
            target.show();
        }
        else {
            target.hide();
        }
    });
}

function getControlInfoByName(name) {
    for (var controlKey in controlDictionary) {
        if (controlDictionary[controlKey].name == name) return controlDictionary[controlKey];
    }
    return undefined;
}