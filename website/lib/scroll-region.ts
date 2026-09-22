// SPDX-License-Identifier: Apache-2.0
import type { KeyboardEvent } from 'react';

// Safari can focus a <pre> without scrolling it for arrow keys.
export function handleScrollKey(event: KeyboardEvent<HTMLElement>) {
  const region = event.currentTarget;
  if (event.target !== region || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  if (region.scrollWidth <= region.clientWidth) return;
  event.preventDefault();
  region.scrollLeft += event.key === 'ArrowRight' ? 40 : -40;
}
