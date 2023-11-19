/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */

import { Test, TestingModule } from '@nestjs/testing';
import { CiudadSupermercadoService } from './ciudad-supermercado.service';
import { CiudadEntity } from '../ciudad/ciudad.entity';
import { SupermercadoEntity } from '../supermercado/supermercado.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';

describe('CiudadSupermercadoService', () => {
  let service: CiudadSupermercadoService;
  let ciudadRepository: Repository<CiudadEntity>;
  let supermercadoRepository: Repository<SupermercadoEntity>;
  let ciudad: CiudadEntity;
  let supermercadosList : SupermercadoEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [CiudadSupermercadoService],
    }).compile();

    service = module.get<CiudadSupermercadoService>(CiudadSupermercadoService);
    ciudadRepository = module.get<Repository<CiudadEntity>>(getRepositoryToken(CiudadEntity));
    supermercadoRepository = module.get<Repository<SupermercadoEntity>>(getRepositoryToken(SupermercadoEntity));

    await seedDatabase();
  });

  const seedDatabase = async () => {
    supermercadoRepository.clear();
    ciudadRepository.clear();

    supermercadosList = [];
    for(let i = 0; i < 5; i++){
        const supermercado: SupermercadoEntity = await supermercadoRepository.save({
          name: faker.company.name(), 
          longitude: faker.location.longitude(), 
          latitude: faker.location.latitude(),
          web: faker.internet.domainName()
        })
        supermercadosList.push(supermercado);
    }

    ciudad = await ciudadRepository.save({
      name: faker.location.city(), 
      country: faker.location.country(), 
      population: faker.number.int({ min: 10, max:10000000 }),
      supermercados: supermercadosList
    })
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addSupermarketToCity should add an supermarket to a city', async () => {
    const newSupermercado: SupermercadoEntity = await supermercadoRepository.save({
      name: faker.company.name(), 
      longitude: faker.location.longitude(), 
      latitude: faker.location.latitude(),
      web: faker.internet.domainName()
    });

    const newCiudad: CiudadEntity = await ciudadRepository.save({
      name: faker.location.city(), 
      country: faker.location.country(), 
      population: faker.number.int({ min: 10, max:10000000 })
    })

    const result: CiudadEntity = await service.addSupermarketToCity(newCiudad.id, newSupermercado.id);
    
    expect(result.supermercados.length).toBe(1);
    expect(result.supermercados[0]).not.toBeNull();
    expect(result.supermercados[0].name).toBe(newSupermercado.name)
    expect(result.supermercados[0].longitude).toBe(newSupermercado.longitude)
    expect(result.supermercados[0].latitude).toBe(newSupermercado.latitude)
    expect(result.supermercados[0].web).toBe(newSupermercado.web)
  });

  it('addSupermarketToCity should thrown exception for an invalid supermarket', async () => {
    const newCiudad: CiudadEntity = await ciudadRepository.save({
      name: faker.location.city(), 
      country: faker.location.country(), 
      population: faker.number.int({ min: 10, max:10000000 })
    })

    await expect(() => service.addSupermarketToCity(newCiudad.id, "0")).rejects.toHaveProperty("message", "The supermarket with the given id was not found");
  });

  it('addSupermarketToCity should throw an exception for an invalid city', async () => {
    const newSupermercado: SupermercadoEntity = await supermercadoRepository.save({
      name: faker.company.name(), 
      longitude: faker.location.longitude(), 
      latitude: faker.location.latitude(),
      web: faker.internet.domainName()
    });

    await expect(() => service.addSupermarketToCity("0", newSupermercado.id)).rejects.toHaveProperty("message", "The city with the given id was not found");
  });

  it('findAllSupermarketsFromCity should return supermarkets by city', async ()=>{
    const supermercados: SupermercadoEntity[] = await service.findAllSupermarketsFromCity(ciudad.id);
    expect(supermercados.length).toBe(5)
  });

  it('findAllSupermarketsFromCity should throw an exception for an invalid city', async () => {
    await expect(()=> service.findAllSupermarketsFromCity("0")).rejects.toHaveProperty("message", "The city with the given id was not found"); 
  });

  it('findSupermarketFromCity should return supermarket by city', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
    const storedSupermercado: SupermercadoEntity = await service.findSupermarketFromCity(ciudad.id, supermercado.id, )
    expect(storedSupermercado).not.toBeNull();
    expect(storedSupermercado.name).toBe(supermercado.name);
    expect(storedSupermercado.longitude).toBe(supermercado.longitude);
    expect(storedSupermercado.latitude).toBe(supermercado.latitude);
    expect(storedSupermercado.web).toBe(supermercado.web);
  });

  it('findSupermarketFromCity should throw an exception for an invalid supermarket', async () => {
    await expect(()=> service.findSupermarketFromCity(ciudad.id, "0")).rejects.toHaveProperty("message", "The supermarket with the given id was not found"); 
  });

  it('findSupermarketFromCity should throw an exception for an invalid city', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0]; 
    await expect(()=> service.findSupermarketFromCity("0", supermercado.id)).rejects.toHaveProperty("message", "The city with the given id was not found"); 
  });

  it('findSupermarketFromCity should throw an exception for an supermarket not associated to the city', async () => {
    const newSupermercado: SupermercadoEntity = await supermercadoRepository.save({
      name: faker.company.name(), 
      longitude: faker.location.longitude(), 
      latitude: faker.location.latitude(),
      web: faker.internet.domainName()
    });

    await expect(()=> service.findSupermarketFromCity(ciudad.id, newSupermercado.id)).rejects.toHaveProperty("message", "The supermarket with the given id is not associated to the city"); 
  });

  it('updateSupermarketsFromCity should update supermarkets list for a city', async () => {
    const newSupermercado: SupermercadoEntity = await supermercadoRepository.save({
      name: faker.company.name(), 
      longitude: faker.location.longitude(), 
      latitude: faker.location.latitude(),
      web: faker.internet.domainName()
    });

    const updatedCiudad: CiudadEntity = await service.updateSupermarketsFromCity(ciudad.id, [newSupermercado]);
    expect(updatedCiudad.supermercados.length).toBe(1);

    expect(updatedCiudad.supermercados[0].name).toBe(newSupermercado.name);
    expect(updatedCiudad.supermercados[0].longitude).toBe(newSupermercado.longitude);
    expect(updatedCiudad.supermercados[0].latitude).toBe(newSupermercado.latitude);
    expect(updatedCiudad.supermercados[0].web).toBe(newSupermercado.web);
  });

  it('updateSupermarketsFromCity should throw an exception for an invalid city', async () => {
    const newSupermercado: SupermercadoEntity = await supermercadoRepository.save({
      name: faker.company.name(), 
      longitude: faker.location.longitude(), 
      latitude: faker.location.latitude(),
      web: faker.internet.domainName()
    });

    await expect(()=> service.updateSupermarketsFromCity("0", [newSupermercado])).rejects.toHaveProperty("message", "The city with the given id was not found"); 
  });

  it('updateSupermarketsFromCity should throw an exception for an invalid supermarket', async () => {
    const newSupermercado: SupermercadoEntity = supermercadosList[0];
    newSupermercado.id = "0";

    await expect(()=> service.updateSupermarketsFromCity(ciudad.id, [newSupermercado])).rejects.toHaveProperty("message", "The supermarket with the given id was not found"); 
  });

  it('deleteSupermarketFromCity should remove an supermarket from a city', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
    
    await service.deleteSupermarketFromCity(ciudad.id, supermercado.id);

    const storedCiudad: CiudadEntity = await ciudadRepository.findOne({where: {id: ciudad.id}, relations: ["supermercados"]});
    const deletedSupermercado: SupermercadoEntity = storedCiudad.supermercados.find(a => a.id === supermercado.id);

    expect(deletedSupermercado).toBeUndefined();

  });

  it('deleteSupermarketFromCity should thrown an exception for an invalid supermarket', async () => {
    await expect(()=> service.deleteSupermarketFromCity(ciudad.id, "0")).rejects.toHaveProperty("message", "The supermarket with the given id was not found"); 
  });

  it('deleteSupermarketFromCity should thrown an exception for an invalid city', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
    await expect(()=> service.deleteSupermarketFromCity("0", supermercado.id)).rejects.toHaveProperty("message", "The city with the given id was not found"); 
  });

  it('deleteSupermarketFromCity should thrown an exception for an non asocciated supermarket', async () => {
    const newSupermercado: SupermercadoEntity = await supermercadoRepository.save({
      name: faker.company.name(), 
      longitude: faker.location.longitude(), 
      latitude: faker.location.latitude(),
      web: faker.internet.domainName()
    });

    await expect(()=> service.deleteSupermarketFromCity(ciudad.id, newSupermercado.id)).rejects.toHaveProperty("message", "The supermarket with the given id is not associated to the city"); 
  }); 
});
