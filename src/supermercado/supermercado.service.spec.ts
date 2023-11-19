/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */

import { Test, TestingModule } from '@nestjs/testing';
import { SupermercadoService } from './supermercado.service';
import { SupermercadoEntity } from './supermercado.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';

describe('SupermercadoService', () => {
  let service: SupermercadoService;
  let repository: Repository<SupermercadoEntity>;
  let supermercadosList: SupermercadoEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [SupermercadoService],
    }).compile();

    service = module.get<SupermercadoService>(SupermercadoService);
    repository = module.get<Repository<SupermercadoEntity>>(getRepositoryToken(SupermercadoEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    supermercadosList = [];
    for(let i = 0; i < 5; i++){
        const supermercado: SupermercadoEntity = await repository.save({
          name: faker.company.name(), 
          longitude: faker.location.longitude(), 
          latitude: faker.location.latitude(),
          web: faker.internet.domainName()
        })
        supermercadosList.push(supermercado);
    }
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all supermarkets', async () => {
    const supermercados: SupermercadoEntity[] = await service.findAll();
    expect(supermercados).not.toBeNull();
    expect(supermercados).toHaveLength(supermercadosList.length);
  });

  it('findOne should return a supermarket by id', async () => {
    const storedSupermercado: SupermercadoEntity = supermercadosList[0];
    const supermercado: SupermercadoEntity = await service.findOne(storedSupermercado.id);
    expect(supermercado).not.toBeNull();
    expect(supermercado.name).toEqual(storedSupermercado.name)
    expect(supermercado.longitude).toEqual(storedSupermercado.longitude)
    expect(supermercado.latitude).toEqual(storedSupermercado.latitude)
    expect(supermercado.web).toEqual(storedSupermercado.web)
  });

  it('findOne should throw an exception for an invalid supermarket', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "The supermarket with the given id was not found")
  });

  it('create should return a new supermarket', async () => {
    const supermercado: SupermercadoEntity = {
      id: "",
      name: faker.company.name(), 
      longitude: faker.location.longitude(), 
      latitude: faker.location.latitude(),
      web: faker.internet.domainName(),
      ciudades: []
    }

    const newSupermercado: SupermercadoEntity = await service.create(supermercado);
    expect(newSupermercado).not.toBeNull();

    const storedSupermercado: SupermercadoEntity = await repository.findOne({where: {id: newSupermercado.id}})
    expect(storedSupermercado).not.toBeNull();
    expect(storedSupermercado.name).toEqual(newSupermercado.name)
    expect(storedSupermercado.longitude).toEqual(newSupermercado.longitude)
    expect(storedSupermercado.latitude).toEqual(newSupermercado.latitude)
    expect(storedSupermercado.web).toEqual(newSupermercado.web)
  });

  it('update should modify a supermarket', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
    supermercado.name = "New supermarket";
    supermercado.web = "New web";
  
    const updateSupermercado: SupermercadoEntity = await service.update(supermercado.id, supermercado);
    expect(updateSupermercado).not.toBeNull();
  
    const storedCiudad: SupermercadoEntity = await repository.findOne({ where: { id: supermercado.id } })
    expect(storedCiudad).not.toBeNull();
    expect(storedCiudad.name).toEqual(supermercado.name)
    expect(storedCiudad.web).toEqual(supermercado.web)
  });

  it('update should throw an exception for an invalid supermarket', async () => {
    let supermercado: SupermercadoEntity = supermercadosList[0];
    supermercado = {
      ...supermercado, name: "New supermarket", web: "New web"
    }
    await expect(() => service.update("0", supermercado)).rejects.toHaveProperty("message", "The supermarket with the given id was not found")
  });

  it('delete should remove a supermarket', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
    await service.delete(supermercado.id);
  
    const deletedSupermercado: SupermercadoEntity = await repository.findOne({ where: { id: supermercado.id } })
    expect(deletedSupermercado).toBeNull();
  });

  it('delete should throw an exception for an invalid supermarket', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
    await service.delete(supermercado.id);
    await expect(() => service.delete("0")).rejects.toHaveProperty("message", "The supermarket with the given id was not found")
  });
});
