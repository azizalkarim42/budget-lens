// =============================================================================
// Persistence Layer — BudgetLens.Storage
//
// All application state is persisted to the browser's localStorage as JSON.
// Nothing is sent to a server; the app works fully offline.
//
// Storage keys:
//   budgetlens_categories  — serialised Category list
//   budgetlens_expenses    — serialised Expense list
//   budgetlens_currency    — user's selected Currency code ("EUR", "USD", etc.)
//
// Serialisation uses Thoth.Json for type-safe encode/decode.
// Decode errors are silently swallowed and replaced with safe defaults so that
// a corrupted or missing entry never crashes the app on startup.
//
// Public API (called from App.fs init and update):
//   saveCategories / loadCategories  — persists the full category list
//   saveExpenses   / loadExpenses    — persists the full expense list
//   saveCurrency   / loadCurrency    — persists the currency preference
// =============================================================================

module BudgetLens.Storage

open System
open Fable.Core
open Browser
open Thoth.Json
open BudgetLens.Types

/// JSON encoders
module Encode =
    let category (c: Category) =
        Encode.object
            [ "id", Encode.guid c.Id
              "name", Encode.string c.Name
              "icon", Encode.string c.Icon
              "color", Encode.string c.Color
              "monthlyBudget",
                match c.MonthlyBudget with
                | Some b -> Encode.float b
                | None -> Encode.nil ]

    let expense (e: Expense) =
        Encode.object
            [ "id", Encode.guid e.Id
              "categoryId", Encode.guid e.CategoryId
              "amount", Encode.float e.Amount
              "description", Encode.string e.Description
              "date", Encode.datetime e.Date ]

    let currency (c: Currency) =
        Encode.string c.Code

/// JSON decoders
module Decode =
    let category: Decoder<Category> =
        Decode.object (fun get ->
            { Id = get.Required.Field "id" Decode.guid
              Name = get.Required.Field "name" Decode.string
              Icon = get.Required.Field "icon" Decode.string
              Color = get.Required.Field "color" Decode.string
              MonthlyBudget = get.Optional.Field "monthlyBudget" Decode.float })

    let expense: Decoder<Expense> =
        Decode.object (fun get ->
            { Id = get.Required.Field "id" Decode.guid
              CategoryId = get.Required.Field "categoryId" Decode.guid
              Amount = get.Required.Field "amount" Decode.float
              Description = get.Required.Field "description" Decode.string
              Date = get.Required.Field "date" Decode.datetime })

    let currency: Decoder<Currency> =
        Decode.string
        |> Decode.andThen (fun code ->
            match code with
            | "EUR" -> Decode.succeed EUR
            | "USD" -> Decode.succeed USD
            | "GBP" -> Decode.succeed GBP
            | "HUF" -> Decode.succeed HUF
            | _ -> Decode.succeed EUR)

/// LocalStorage keys
[<Literal>]
let private CategoriesKey = "budgetlens_categories"

[<Literal>]
let private ExpensesKey = "budgetlens_expenses"

[<Literal>]
let private CurrencyKey = "budgetlens_currency"

/// Save and load helpers
let private save (key: string) (value: string) =
    window.localStorage.setItem (key, value)

let private load (key: string) =
    window.localStorage.getItem key
    |> Option.ofObj

/// Save categories
let saveCategories (categories: Category list) =
    categories
    |> List.map Encode.category
    |> Encode.list
    |> Encode.toString 0
    |> save CategoriesKey

/// Load categories (returns defaults if none saved)
let loadCategories () : Category list =
    load CategoriesKey
    |> Option.bind (fun json ->
        match Decode.fromString (Decode.list Decode.category) json with
        | Ok cats -> Some cats
        | Error _ -> None)
    |> Option.defaultValue Defaults.categories

/// Save expenses
let saveExpenses (expenses: Expense list) =
    expenses
    |> List.map Encode.expense
    |> Encode.list
    |> Encode.toString 0
    |> save ExpensesKey

/// Load expenses
let loadExpenses () : Expense list =
    load ExpensesKey
    |> Option.bind (fun json ->
        match Decode.fromString (Decode.list Decode.expense) json with
        | Ok exps -> Some exps
        | Error _ -> None)
    |> Option.defaultValue []

/// Save currency preference
let saveCurrency (currency: Currency) =
    currency
    |> Encode.currency
    |> Encode.toString 0
    |> save CurrencyKey

/// Load currency preference
let loadCurrency () : Currency =
    load CurrencyKey
    |> Option.bind (fun json ->
        match Decode.fromString Decode.currency json with
        | Ok c -> Some c
        | Error _ -> None)
    |> Option.defaultValue EUR
