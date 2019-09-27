import { TestBed } from '@angular/core/testing';

import { TxtSqlService } from './txt-sql.service';

describe('TxtSqlService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TxtSqlService = TestBed.get(TxtSqlService);
    expect(service).toBeTruthy();
  });
});
