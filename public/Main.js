import { createElement } from "react";
import React from "react";
import { reactApi } from "./fable_modules/Feliz.2.9.0/Interop.fs.js";
import { update, view, init } from "./App.js";
import { printf, toText } from "./fable_modules/fable-library-js.4.24.0/String.js";
import { createRoot } from "react-dom/client";

/**
 * Root React component with state management
 */
export function AppComponent() {
    const patternInput = reactApi.useState(init);
    const model = patternInput[0];
    const dependencies = [model.ActiveView];
    reactApi.useEffect(() => {
        let viewName;
        const matchValue = model.ActiveView;
        viewName = ((matchValue.tag === 1) ? "Expenses" : ((matchValue.tag === 2) ? "Add Expense" : ((matchValue.tag === 3) ? "Settings" : "Dashboard")));
        document.title = toText(printf("%s | BudgetLens"))(viewName);
    }, dependencies);
    return view(model, (msg) => {
        patternInput[1](update(msg, model));
    });
}

export const root = createRoot(document.getElementById("app"));

root.render(createElement(AppComponent, null));

