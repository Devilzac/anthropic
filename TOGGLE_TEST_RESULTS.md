# Toggle Buttons Test Results

## Issue Report
User reported that toggle buttons "sometimes" feel like they aren't working.
Toggle buttons are the Preview/Code tabs in the main application.

## Investigation Results

### Test Environment
- Component: `src/app/main-content.tsx`
- Radix UI Version: `@radix-ui/react-tabs@1.1.12`
- Latest Version Available: `1.1.13`

### Testing Performed

#### 1. Unit Test with Minimal Tabs Component ✅ PASS
- Created isolated Tabs component test
- Result: Works perfectly
- `onValueChange` callback fires correctly
- State updates properly
- Conclusion: Tabs component itself is functional

#### 2. Unit Test with Full MainContent Component ⚠️  PARTIAL FAIL
- Test Method 1: `fireEvent.click()` - **FAILS**
  - Button state does NOT change from "inactive" to "active"
  - Content does NOT switch
  - Code editor does NOT appear

- Test Method 2: `fireEvent.mouseDown()` - **PASSES**
  - Button state changes from "inactive" to "active"
  - Content switches correctly
  - Code editor appears

### Root Cause Analysis

**Radix UI Tabs relies primarily on `mouseDown` events rather than standard `click` events.**

In production with a real mouse:
- User clicks button → triggers `mouseDown` → works ✅

In different scenarios:
- Keyboard navigation (Enter/Space) → may not trigger `mouseDown` → may fail ⚠️
- Touch events on mobile → different event flow → may be inconsistent ⚠️
- Assistive technologies → simulated clicks → may not trigger `mouseDown` → may fail ⚠️
- Fast/rapid clicking → event timing issues → may miss events ⚠️

### Known Issues in Radix UI

Research found several related issues in the Radix UI repository:
- Issue #2034: Unable to switch tabs in @testing-library/react tests
- Issue #2335: Wrapped Tab.Trigger breaks focus in controlled tabs
- Issue #1047: Screen reader focus behavior

### Conclusion

The toggle buttons ARE working for standard mouse interactions, but have:
1. **Accessibility concerns** - keyboard navigation may not work properly
2. **Testing issues** - standard testing libraries can't interact with them properly
3. **Potential mobile issues** - touch events may behave inconsistently

This explains why the user reports it "sometimes" doesn't work - it depends on the interaction method.

### Recommendations

1. **Upgrade Radix UI**: Update from 1.1.12 to 1.1.13 (latest)
2. **Add explicit click handlers**: Ensure keyboard/accessibility support
3. **Test across interaction methods**: Verify mouse, keyboard, and touch work
4. **Consider alternative implementation**: If issues persist, may need custom tabs

### Test Files Created

- `src/app/__tests__/tabs-minimal.test.tsx` - Isolated tabs test (passes)
- `src/app/__tests__/toggle-buttons.test.tsx` - Full integration test (fails)
- `src/app/__tests__/debug-main-content.test.tsx` - Debug test with logging
- `src/app/__tests__/direct-click.test.tsx` - Event comparison test

### Evidence

```
Test: fireEvent.click
Before click: inactive
After click: inactive ← NO CHANGE
Code editor visible: false

Test: fireEvent.mouseDown
Before mouseDown: inactive
After mouseDown: active ← WORKS
Code editor visible: true
```
