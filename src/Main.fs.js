import { createElement } from "react";
import React from "react";
import { reactApi } from "./fable_modules/Feliz.2.9.0/./Interop.fs.js";
import { view, update, init } from "./App.fs.js";
import { printf, toText } from "./fable_modules/fable-library-js.4.24.0/String.js";
import { createRoot } from "react-dom/client";

/**
 * Root React component with state management
 */
export function AppComponent() {
    const patternInput = reactApi.useState(init);
    const setModel = patternInput[1];
    const model = patternInput[0];
    const dispatch = (msg) => {
        setModel(update(msg, model));
    };
    const dependencies = [model.ActiveView];
    reactApi.useEffect(() => {
        let viewName;
        const matchValue = model.ActiveView;
        viewName = ((matchValue.tag === 1) ? "Expenses" : ((matchValue.tag === 2) ? "Add Expense" : ((matchValue.tag === 3) ? "Settings" : "Dashboard")));
        document.title = toText(printf("%s | BudgetLens"))(viewName);
    }, dependencies);
    return view(model, dispatch);
}

export const root = createRoot(document.getElementById("app"));

root.render(createElement(AppComponent, null));

