import { Test, TestingModule } from '@nestjs/testing';
import { FichierController } from './fichier.controller';
import { FichierService } from './fichier.service';

describe('FichierController', () => {
  let controller: FichierController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FichierController],
      providers: [FichierService],
    }).compile();

    controller = module.get<FichierController>(FichierController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
