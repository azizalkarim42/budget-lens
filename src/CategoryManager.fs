module BudgetLens.CategoryManager

open System
open Feliz
open BudgetLens.Types

/// Icon picker grid
let private iconPicker (selected: string) (dispatch: Msg -> unit) =
    Html.div [
        prop.className "icon-grid"
        prop.children [
            for icon in Defaults.icons do
                Html.button [
                    prop.className (if icon = selected then "icon-btn selected" else "icon-btn")
                    prop.text icon
                    prop.onClick (fun _ -> dispatch (SetCategoryIcon icon))
                ]
        ]
    ]

/// Add/edit category form
let private categoryForm (model: Model) (dispatch: Msg -> unit) =
    let isEditing = model.EditingCategoryId.IsSome

    Html.div [
        prop.className "category-form"
        prop.children [
            Html.h3 [ prop.text (if isEditing then "Edit Category" else "Add Category") ]

            Html.div [
                prop.className "form-row"
                prop.children [
                    Html.input [
                        prop.className "text-input"
                        prop.placeholder "Category name..."
                        prop.value model.CategoryForm.Name
                        prop.onChange (fun (v: string) -> dispatch (SetCategoryName v))
                        prop.onKeyDown (fun e ->
                            if e.key = "Enter" && model.CategoryForm.Name.Trim() <> "" then
                                if isEditing then dispatch SaveCategory
                                else dispatch AddCategory)
                    ]
                    Html.input [
                        prop.className "color-input"
                        prop.type'.color
                        prop.value model.CategoryForm.Color
                        prop.onChange (fun (v: string) -> dispatch (SetCategoryColor v))
                    ]
                ]
            ]

            // Icon selector
            Html.label [ prop.className "form-label"; prop.text "Icon" ]
            iconPicker model.CategoryForm.Icon dispatch

            // Monthly budget
            Html.div [
                prop.className "form-row"
                prop.children [
                    Html.label [ prop.className "form-label"; prop.text "Monthly Budget (optional)" ]
                    Html.input [
                        prop.className "text-input budget-input"
                        prop.type'.number
                        prop.placeholder "No limit"
                        prop.value model.CategoryForm.MonthlyBudget
                        prop.onChange (fun (v: string) -> dispatch (SetCategoryBudget v))
                    ]
                ]
            ]

            Html.div [
                prop.className "form-actions"
                prop.children [
                    Html.button [
                        prop.className "btn btn-primary btn-small"
                        prop.text (if isEditing then "Save" else "Add")
                        prop.disabled (model.CategoryForm.Name.Trim() = "")
                        prop.onClick (fun _ ->
                            if isEditing then dispatch SaveCategory
                            else dispatch AddCategory)
                    ]
                    if isEditing then
                        Html.button [
                            prop.className "btn btn-secondary btn-small"
                            prop.text "Cancel"
                            prop.onClick (fun _ -> dispatch CancelCategoryEdit)
                        ]
                ]
            ]
        ]
    ]

/// Render a single category item
let private categoryItem (cat: Category) (currency: Currency) (dispatch: Msg -> unit) =
    Html.div [
        prop.className "category-item"
        prop.children [
            Html.div [
                prop.className "cat-icon"
                prop.style [ style.backgroundColor cat.Color ]
                prop.text cat.Icon
            ]
            Html.div [
                prop.className "cat-info"
                prop.children [
                    Html.span [ prop.className "cat-name"; prop.text cat.Name ]
                    match cat.MonthlyBudget with
                    | Some budget ->
                        Html.span [
                            prop.className "cat-budget"
                            prop.text (sprintf "Budget: %s/mo" (Format.amount currency budget))
                        ]
                    | None ->
                        Html.span [
                            prop.className "cat-budget"
                            prop.text "No budget set"
                        ]
                ]
            ]
            Html.div [
                prop.className "cat-actions"
                prop.children [
                    Html.button [
                        prop.className "btn-icon"
                        prop.title "Edit"
                        prop.text "\u270E"
                        prop.onClick (fun _ -> dispatch (EditCategory cat.Id))
                    ]
                    Html.button [
                        prop.className "btn-icon btn-delete"
                        prop.title "Delete"
                        prop.text "\u00D7"
                        prop.onClick (fun _ -> dispatch (DeleteCategory cat.Id))
                    ]
                ]
            ]
        ]
    ]

/// Currency selector
let private currencySelector (current: Currency) (dispatch: Msg -> unit) =
    Html.div [
        prop.className "currency-section"
        prop.children [
            Html.h3 [ prop.text "Currency" ]
            Html.div [
                prop.className "currency-pills"
                prop.children [
                    let currencies = [ EUR; USD; GBP; HUF ]
                    for curr in currencies do
                        Html.button [
                            prop.className (if current = curr then "pill active" else "pill")
                            prop.text (sprintf "%s %s" curr.Symbol curr.Code)
                            prop.onClick (fun _ -> dispatch (SetCurrency curr))
                        ]
                ]
            ]
        ]
    ]

/// Main categories/settings view
let view (model: Model) (dispatch: Msg -> unit) =
    Html.div [
        prop.className "categories-page"
        prop.children [
            Html.h2 [ prop.text "Categories & Settings" ]

            categoryForm model dispatch

            Html.div [
                prop.className "categories-list"
                prop.children [
                    Html.h3 [ prop.text "Your Categories" ]
                    if model.Categories.IsEmpty then
                        Html.p [
                            prop.className "empty-hint"
                            prop.text "Add your first category to organize your expenses."
                        ]
                    else
                        for cat in model.Categories do
                            categoryItem cat model.Currency dispatch
                ]
            ]

            currencySelector model.Currency dispatch

            // Danger zone
            Html.div [
                prop.className "danger-zone"
                prop.children [
                    Html.h3 [ prop.text "Data Management" ]
                    Html.button [
                        prop.className "btn btn-danger"
                        prop.text "Clear All Expenses"
                        prop.onClick (fun _ -> dispatch ClearAllExpenses)
                    ]
                ]
            ]
        ]
    ]
