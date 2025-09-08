import React from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import Icon from './Icon';

interface AICommand {
  title: string;
  command: (props: { editor: any, range: any }) => void;
  isFreeform?: boolean;
}

class AICommandList {
  element: HTMLDivElement;
  props: any;
  selectedIndex: number;

  constructor(props: any) {
    this.props = props;
    this.selectedIndex = 0;

    this.element = document.createElement('div');
    this.element.className = 'w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 p-2 z-50';
    
    document.body.appendChild(this.element);
    this.render();
    this.updatePosition();
  }

  updateProps(props: any) {
    this.props = props;
    this.selectedIndex = 0; // Reset index on update
    this.render();
    this.updatePosition();
  }
  
  updatePosition() {
    const { view, state } = this.props.editor;
    const { from, to } = state.selection;
    const start = view.coordsAtPos(from);
    const end = view.coordsAtPos(to);
    const top = Math.max(start.top, end.top) + 20;
    
    this.element.style.position = 'absolute';
    this.element.style.left = `${start.left}px`;
    this.element.style.top = `${top}px`;
  }

  render() {
    const items = this.props.items.map((item: AICommand, index: number) => {
        const itemEl = document.createElement('div');
        itemEl.className = `flex items-center gap-2 p-2 rounded-md cursor-pointer ${index === this.selectedIndex ? 'bg-gray-100 dark:bg-gray-700' : ''}`;
        
        const iconContainer = document.createElement('div');
        const iconEl = item.isFreeform ? '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-gray-500"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"></path></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-purple-500"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"></path></svg>';
        iconContainer.innerHTML = iconEl;
        
        const titleEl = document.createElement('span');
        titleEl.textContent = item.title;
        titleEl.className = 'text-sm';
        
        itemEl.appendChild(iconContainer);
        itemEl.appendChild(titleEl);
        
        itemEl.addEventListener('click', () => this.selectItem(index));

        return itemEl;
    });
    
    this.element.innerHTML = '';
    items.forEach(item => this.element.appendChild(item));
  }

  onKeyDown({ event }: { event: KeyboardEvent }) {
    if (event.key === 'ArrowUp') {
      this.upHandler();
      return true;
    }
    if (event.key === 'ArrowDown') {
      this.downHandler();
      return true;
    }
    if (event.key === 'Enter') {
      this.enterHandler();
      return true;
    }
    return false;
  }
  
  upHandler() {
    this.selectedIndex = (this.selectedIndex + this.props.items.length - 1) % this.props.items.length;
    this.render();
  }
  
  downHandler() {
    this.selectedIndex = (this.selectedIndex + 1) % this.props.items.length;
    this.render();
  }

  enterHandler() {
    this.selectItem(this.selectedIndex);
  }

  selectItem(index: number) {
    const item = this.props.items[index];
    if (item) {
      this.props.command(item);
    }
  }
}

export default AICommandList;