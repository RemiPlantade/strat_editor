import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Agent } from '@strat-editor/data';

@Component({
  selector: 'strat-editor-agents-grid',
  templateUrl: './agents-grid.component.html',
  styleUrls: ['./agents-grid.component.scss'],
})
export class AgentsGridComponent implements OnInit {
  @Input() agents: Agent[];
  @Output() agentDragged = new EventEmitter<Agent>();
  ngOnInit(): void {
    console.log('agents:', this.agents);
  }
  onAgentDragged(agent: Agent) {
    this.agentDragged.emit(agent);
  }
}
