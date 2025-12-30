import { Test, TestingModule } from '@nestjs/testing';
import { TypeRubriqueController } from './type-rubrique.controller';
import { TypeRubriqueService } from './type-rubrique.service';

describe('TypeRubriqueController', () => {
  let controller: TypeRubriqueController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypeRubriqueController],
      providers: [TypeRubriqueService],
    }).compile();

    controller = module.get<TypeRubriqueController>(TypeRubriqueController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
