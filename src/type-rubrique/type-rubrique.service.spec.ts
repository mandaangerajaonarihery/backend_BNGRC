import { Test, TestingModule } from '@nestjs/testing';
import { TypeRubriqueService } from './type-rubrique.service';

describe('TypeRubriqueService', () => {
  let service: TypeRubriqueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TypeRubriqueService],
    }).compile();

    service = module.get<TypeRubriqueService>(TypeRubriqueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
