import { Test, TestingModule } from '@nestjs/testing';
import { FichierService } from './fichier.service';

describe('FichierService', () => {
  let service: FichierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FichierService],
    }).compile();

    service = module.get<FichierService>(FichierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
