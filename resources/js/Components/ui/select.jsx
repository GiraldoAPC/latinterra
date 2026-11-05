import { Children, createContext, forwardRef, isValidElement, useContext } from 'react';
import { SmartSelect, selectText } from '@/Components/ui/smart-select';

// Preserve the existing composition API while using one searchable selector everywhere.
const SelectContext = createContext(null);
function collect(children, predicate) {
    return Children.toArray(children).flatMap((child) => !isValidElement(child) ? [] : predicate(child) ? [child] : collect(child.props.children, predicate));
}
export function Select({ children, value, defaultValue = '', onValueChange, disabled, required, name }) {
    const options = collect(children, (child) => child.type === SelectItem).map((child) => ({ value: String(child.props.value), label: child.props.children, text: child.props.textValue ?? selectText(child.props.children), disabled: child.props.disabled }));
    const content = collect(children, (child) => child.type === SelectContent)[0];
    return <SelectContext.Provider value={{ options, value, defaultValue, onValueChange, disabled, required, name, contentClassName: content?.props.className }}>{children}</SelectContext.Provider>;
}
export const SelectTrigger = forwardRef(function SelectTrigger({ children, ...props }, ref) {
    const context = useContext(SelectContext);
    const value = collect(children, (child) => child.type === SelectValue)[0];
    return <SmartSelect {...context} {...props} ref={ref} placeholder={value?.props.placeholder} />;
});
export function SelectValue() { return null; }
export function SelectContent() { return null; }
export function SelectItem() { return null; }
export function SelectGroup({ children }) { return children; }
