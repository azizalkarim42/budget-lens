import { createElement } from "react";
import { equals, createObj } from "./fable_modules/fable-library-js.4.24.0/Util.js";
import { Currency__get_Symbol, Format_amount, Msg } from "./Types.fs.js";
import { reactApi } from "./fable_modules/Feliz.2.9.0/./Interop.fs.js";
import { map, empty, singleton, append, delay, toList } from "./fable_modules/fable-library-js.4.24.0/Seq.js";
import { singleton as singleton_1, ofArray } from "./fable_modules/fable-library-js.4.24.0/List.js";
import { tryParse } from "./fable_modules/fable-library-js.4.24.0/Double.js";
import { FSharpRef } from "./fable_modules/fable-library-js.4.24.0/Types.js";

function categoryOption(cat, isSelected, dispatch) {
    let elems;
    return createElement("div", createObj(ofArray([["className", isSelected ? "cat-chip selected" : "cat-chip"], ["onClick", (_arg) => {
        dispatch(new Msg(3, [cat.Id]));
    }], (elems = [createElement("span", {
        className: "cat-chip-icon",
        children: cat.Icon,
    }), createElement("span", {
        className: "cat-chip-name",
        children: cat.Name,
    })], ["children", reactApi.Children.toArray(Array.from(elems))]), ["style", createObj(toList(delay(() => (isSelected ? append(singleton(["backgroundColor", cat.Color]), delay(() => append(singleton(["color", "white"]), delay(() => singleton(["borderColor", cat.Color]))))) : empty()))))]])));
}

function categorySelector(categories, selected, dispatch) {
    let elems;
    return createElement("div", createObj(ofArray([["className", "category-grid"], (elems = toList(delay(() => map((cat) => categoryOption(cat, equals(selected, cat.Id), dispatch), categories))), ["children", reactApi.Children.toArray(Array.from(elems))])])));
}

function formField(label, children) {
    let elems;
    return createElement("div", createObj(ofArray([["className", "form-field"], (elems = toList(delay(() => append(singleton(createElement("label", {
        className: "form-label",
        children: label,
    })), delay(() => children)))), ["children", reactApi.Children.toArray(Array.from(elems))])])));
}

function quickAmounts(currency, dispatch) {
    let elems;
    const amounts = (currency.tag === 3) ? ofArray([500, 1000, 2000, 5000]) : ofArray([5, 10, 20, 50]);
    return createElement("div", createObj(ofArray([["className", "quick-amounts"], (elems = toList(delay(() => map((amt) => createElement("button", {
        className: "quick-amt-btn",
        children: Format_amount(currency, amt),
        onClick: (_arg) => {
            dispatch(new Msg(1, [amt.toString()]));
        },
    }), amounts))), ["children", reactApi.Children.toArray(Array.from(elems))])])));
}

/**
 * Main expense form view
 */
export function view(model, dispatch) {
    let elems_2, elems, elems_1;
    const isEditing = model.ExpenseForm.EditingId != null;
    let canSubmit;
    if ((model.ExpenseForm.Amount !== "") && (model.ExpenseForm.CategoryId != null)) {
        let matchValue;
        let outArg = 0;
        matchValue = [tryParse(model.ExpenseForm.Amount, new FSharpRef(() => outArg, (v) => {
            outArg = v;
        })), outArg];
        if (matchValue[0]) {
            const v_1 = matchValue[1];
            canSubmit = (v_1 > 0);
        }
        else {
            canSubmit = false;
        }
    }
    else {
        canSubmit = false;
    }
    return createElement("div", createObj(ofArray([["className", "expense-form-page"], (elems_2 = [createElement("h2", {
        children: isEditing ? "Edit Expense" : "Add Expense",
    }), formField("Amount", ofArray([createElement("div", createObj(ofArray([["className", "amount-input-wrap"], (elems = [createElement("span", {
        className: "currency-symbol",
        children: Currency__get_Symbol(model.Currency),
    }), createElement("input", {
        className: "amount-input",
        type: "number",
        placeholder: "0.00",
        value: model.ExpenseForm.Amount,
        autoFocus: true,
        onChange: (ev) => {
            dispatch(new Msg(1, [ev.target.value]));
        },
    })], ["children", reactApi.Children.toArray(Array.from(elems))])]))), quickAmounts(model.Currency, dispatch)])), formField("Description", singleton_1(createElement("input", {
        className: "text-input",
        placeholder: "What did you spend on?",
        value: model.ExpenseForm.Description,
        onChange: (ev_1) => {
            dispatch(new Msg(2, [ev_1.target.value]));
        },
    }))), formField("Date", singleton_1(createElement("input", {
        className: "text-input",
        type: "date",
        value: model.ExpenseForm.Date,
        onChange: (ev_2) => {
            dispatch(new Msg(4, [ev_2.target.value]));
        },
    }))), formField("Category", singleton_1(categorySelector(model.Categories, model.ExpenseForm.CategoryId, dispatch))), createElement("div", createObj(ofArray([["className", "form-actions"], (elems_1 = toList(delay(() => append(singleton(createElement("button", {
        className: "btn btn-primary btn-large",
        children: isEditing ? "Save Changes" : "Add Expense",
        disabled: !canSubmit,
        onClick: (_arg) => {
            dispatch(new Msg(5, []));
        },
    })), delay(() => (isEditing ? singleton(createElement("button", {
        className: "btn btn-secondary",
        children: "Cancel",
        onClick: (_arg_1) => {
            dispatch(new Msg(8, []));
        },
    })) : empty()))))), ["children", reactApi.Children.toArray(Array.from(elems_1))])])))], ["children", reactApi.Children.toArray(Array.from(elems_2))])])));
}

