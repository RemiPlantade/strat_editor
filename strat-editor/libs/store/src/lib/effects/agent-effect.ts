import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, catchError, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as actions from '../actions/agent.action';
import { AgentService } from '@strat-editor/services';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class AgentEffect {
  constructor(private actions$: Actions, private agentService: AgentService) {}

  getAllAgents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.FetchAgents),
      mergeMap(() =>
        this.agentService.getAllAgents().pipe(
          map((agents) => actions.FetchAgentsSuccess({ agents })),
          catchError((error: HttpErrorResponse) =>
            of(actions.FetchAgentsError({ error }))
          )
        )
      )
    )
  );
}
