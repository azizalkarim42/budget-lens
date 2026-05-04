import { Union, Record } from "./fable_modules/fable-library-js.4.24.0/Types.js";
import { list_type, union_type, record_type, option_type, float64_type, string_type, class_type } from "./fable_modules/fable-library-js.4.24.0/Reflection.js";
import { now, toString } from "./fable_modules/fable-library-js.4.24.0/Date.js";
import { newGuid } from "./fable_modules/fable-library-js.4.24.0/Guid.js";
import { ofArray } from "./fable_modules/fable-library-js.4.24.0/List.js";
import { printf, toText, format } from "./fable_modules/fable-library-js.4.24.0/String.js";

export class Category extends Record {
    constructor(Id, Name, Icon, Color, MonthlyBudget) {
        super();
        this.Id = Id;
        this.Name = Name;
        this.Icon = Icon;
        this.Color = Color;
        this.MonthlyBudget = MonthlyBudget;
    }
}

export function Category_$reflection() {
    return record_type("BudgetLens.Types.Category", [], Category, () => [["Id", class_type("System.Guid")], ["Name", string_type], ["Icon", string_type], ["Color", string_type], ["MonthlyBudget", option_type(float64_type)]]);
}

export class Expense extends Record {
    constructor(Id, CategoryId, Amount, Description, Date$) {
        super();
        this.Id = Id;
        this.CategoryId = CategoryId;
        this.Amount = Amount;
        this.Description = Description;
        this.Date = Date$;
    }
}

export function Expense_$reflection() {
    return record_type("BudgetLens.Types.Expense", [], Expense, () => [["Id", class_type("System.Guid")], ["CategoryId", class_type("System.Guid")], ["Amount", float64_type], ["Description", string_type], ["Date", class_type("System.DateTime")]]);
}

export class Currency extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["EUR", "USD", "GBP", "HUF"];
    }
}

export function Currency_$reflection() {
    return union_type("BudgetLens.Types.Currency", [], Currency, () => [[], [], [], []]);
}

export function Currency__get_Symbol(this$) {
    switch (this$.tag) {
        case 1:
            return "$";
        case 2:
            return "£";
        case 3:
            return "Ft";
        default:
            return "€";
    }
}

export function Currency__get_Code(this$) {
    switch (this$.tag) {
        case 1:
            return "USD";
        case 2:
            return "GBP";
        case 3:
            return "HUF";
        default:
            return "EUR";
    }
}

export class ActiveView extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["DashboardView", "ExpensesView", "AddExpenseView", "CategoriesView"];
    }
}

export function ActiveView_$reflection() {
    return union_type("BudgetLens.Types.ActiveView", [], ActiveView, () => [[], [], [], []]);
}

export class TimeRange extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["ThisWeek", "ThisMonth", "Last30Days", "Last90Days", "AllTime"];
    }
}

export function TimeRange_$reflection() {
    return union_type("BudgetLens.Types.TimeRange", [], TimeRange, () => [[], [], [], [], []]);
}

export class SortOrder extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["DateDesc", "DateAsc", "AmountDesc", "AmountAsc"];
    }
}

export function SortOrder_$reflection() {
    return union_type("BudgetLens.Types.SortOrder", [], SortOrder, () => [[], [], [], []]);
}

export class ExpenseFormState extends Record {
    constructor(Amount, Description, CategoryId, Date$, EditingId) {
        super();
        this.Amount = Amount;
        this.Description = Description;
        this.CategoryId = CategoryId;
        this.Date = Date$;
        this.EditingId = EditingId;
    }
}

export function ExpenseFormState_$reflection() {
    return record_type("BudgetLens.Types.ExpenseFormState", [], ExpenseFormState, () => [["Amount", string_type], ["Description", string_type], ["CategoryId", option_type(class_type("System.Guid"))], ["Date", string_type], ["EditingId", option_type(class_type("System.Guid"))]]);
}

export function ExpenseFormState_get_Empty() {
    return new ExpenseFormState("", "", undefined, toString(now(), "yyyy-MM-dd"), undefined);
}

export class CategoryFormState extends Record {
    constructor(Name, Icon, Color, MonthlyBudget) {
        super();
        this.Name = Name;
        this.Icon = Icon;
        this.Color = Color;
        this.MonthlyBudget = MonthlyBudget;
    }
}

export function CategoryFormState_$reflection() {
    return record_type("BudgetLens.Types.CategoryFormState", [], CategoryFormState, () => [["Name", string_type], ["Icon", string_type], ["Color", string_type], ["MonthlyBudget", string_type]]);
}

export function CategoryFormState_get_Empty() {
    return new CategoryFormState("", "📦", "#3498db", "");
}

export class Model extends Record {
    constructor(Categories, Expenses, Currency, ActiveView, TimeRange, SortOrder, ExpenseForm, CategoryForm, EditingCategoryId, FilterCategoryId, SearchQuery) {
        super();
        this.Categories = Categories;
        this.Expenses = Expenses;
        this.Currency = Currency;
        this.ActiveView = ActiveView;
        this.TimeRange = TimeRange;
        this.SortOrder = SortOrder;
        this.ExpenseForm = ExpenseForm;
        this.CategoryForm = CategoryForm;
        this.EditingCategoryId = EditingCategoryId;
        this.FilterCategoryId = FilterCategoryId;
        this.SearchQuery = SearchQuery;
    }
}

export function Model_$reflection() {
    return record_type("BudgetLens.Types.Model", [], Model, () => [["Categories", list_type(Category_$reflection())], ["Expenses", list_type(Expense_$reflection())], ["Currency", Currency_$reflection()], ["ActiveView", ActiveView_$reflection()], ["TimeRange", TimeRange_$reflection()], ["SortOrder", SortOrder_$reflection()], ["ExpenseForm", ExpenseFormState_$reflection()], ["CategoryForm", CategoryFormState_$reflection()], ["EditingCategoryId", option_type(class_type("System.Guid"))], ["FilterCategoryId", option_type(class_type("System.Guid"))], ["SearchQuery", string_type]]);
}

export class Msg extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["SetView", "SetAmount", "SetDescription", "SetExpenseCategory", "SetExpenseDate", "SubmitExpense", "EditExpense", "DeleteExpense", "CancelEdit", "SetCategoryName", "SetCategoryIcon", "SetCategoryColor", "SetCategoryBudget", "AddCategory", "EditCategory", "SaveCategory", "DeleteCategory", "CancelCategoryEdit", "SetTimeRange", "SetSortOrder", "SetFilterCategory", "SetSearchQuery", "SetCurrency", "ClearAllExpenses"];
    }
}

export function Msg_$reflection() {
    return union_type("BudgetLens.Types.Msg", [], Msg, () => [[["Item", ActiveView_$reflection()]], [["Item", string_type]], [["Item", string_type]], [["Item", option_type(class_type("System.Guid"))]], [["Item", string_type]], [], [["Item", class_type("System.Guid")]], [["Item", class_type("System.Guid")]], [], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [], [["Item", class_type("System.Guid")]], [], [["Item", class_type("System.Guid")]], [], [["Item", TimeRange_$reflection()]], [["Item", SortOrder_$reflection()]], [["Item", option_type(class_type("System.Guid"))]], [["Item", string_type]], [["Item", Currency_$reflection()]], []]);
}

export const Defaults_categories = ofArray([new Category(newGuid(), "Food & Drinks", "🍔", "#e74c3c", 200), new Category(newGuid(), "Transport", "🚌", "#3498db", 100), new Category(newGuid(), "Shopping", "🛍️", "#9b59b6", 150), new Category(newGuid(), "Entertainment", "🎬", "#f39c12", 80), new Category(newGuid(), "Bills & Utilities", "💡", "#1abc9c", undefined), new Category(newGuid(), "Health", "🏥", "#e67e22", undefined), new Category(newGuid(), "Education", "📚", "#2ecc71", undefined), new Category(newGuid(), "Other", "📦", "#95a5a6", undefined)]);

export const Defaults_icons = ["🍔", "🚌", "🛍️", "🎬", "💡", "🏥", "📚", "📦", "🏠", "✈️", "💻", "🏋️", "🎁", "☕", "💰"];

export function Format_amount(currency, value) {
    if (currency.tag === 3) {
        const arg = format('{0:' + "N0" + '}', value);
        const arg_1 = Currency__get_Symbol(currency);
        return toText(printf("%s %s"))(arg)(arg_1);
    }
    else {
        const arg_2 = Currency__get_Symbol(currency);
        const arg_3 = format('{0:' + "N2" + '}', value);
        return toText(printf("%s%s"))(arg_2)(arg_3);
    }
}

