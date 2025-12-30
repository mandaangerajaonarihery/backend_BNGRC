import { Test, TestingModule } from '@nestjs/testing';
import { RubriquesController } from './rubriques.controller';
import { RubriquesService } from './rubriques.service';

describe('RubriquesController', () => {
  let controller: RubriquesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RubriquesController],
      providers: [RubriquesService],
    }).compile();

    controller = module.get<RubriquesController>(RubriquesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
