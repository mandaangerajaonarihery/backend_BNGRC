import { Test, TestingModule } from '@nestjs/testing';
import { RubriquesService } from './rubriques.service';

describe('RubriquesService', () => {
  let service: RubriquesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RubriquesService],
    }).compile();

    service = module.get<RubriquesService>(RubriquesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
