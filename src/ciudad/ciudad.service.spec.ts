/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */

import { Test, TestingModule } from '@nestjs/testing';
import { CiudadService } from './ciudad.service';
import { Repository } from 'typeorm';
import { CiudadEntity } from './ciudad.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';

describe('CiudadService', () => {
  let service: CiudadService;
  let repository: Repository<CiudadEntity>;
  let ciudadesList: CiudadEntity[];
  const allowedCountries = ['Argentina', 'Ecuador', 'Paraguay'];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [CiudadService],
    }).compile();

    service = module.get<CiudadService>(CiudadService);
    repository = module.get<Repository<CiudadEntity>>(getRepositoryToken(CiudadEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    ciudadesList = [];
    for(let i = 0; i < 5; i++){
        const ciudad: CiudadEntity = await repository.save({
          name: faker.location.city(), 
          country: allowedCountries[i % allowedCountries.length], 
          population: faker.number.int({ min: 10, max:10000000 })
        })
        ciudadesList.push(ciudad);
    }
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all cities', async () => {
    const ciudades: CiudadEntity[] = await service.findAll();
    expect(ciudades).not.toBeNull();
    expect(ciudades).toHaveLength(ciudadesList.length);
  });

  it('findOne should return a city by id', async () => {
    const storedCiudad: CiudadEntity = ciudadesList[0];
    const ciudad: CiudadEntity = await service.findOne(storedCiudad.id);
    expect(ciudad).not.toBeNull();
    expect(ciudad.name).toEqual(storedCiudad.name)
    expect(ciudad.country).toEqual(storedCiudad.country)
    expect(ciudad.population).toEqual(storedCiudad.population)
  });

  it('findOne should throw an exception for an invalid city', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "The city with the given id was not found")
  });

  it('create should return a new city', async () => {

    const randomCountry = allowedCountries[Math.floor(Math.random() * allowedCountries.length)];

    const ciudad: CiudadEntity = {
      id: "",
      name: faker.location.city(), 
      country: randomCountry, 
      population: faker.number.int({ min: 10, max:10000000 }),
      supermercados: []
    }

    const newCiudad: CiudadEntity = await service.create(ciudad);
    expect(newCiudad).not.toBeNull();

    const storedCiudad: CiudadEntity = await repository.findOne({where: {id: newCiudad.id}})
    expect(storedCiudad).not.toBeNull();
    expect(storedCiudad.name).toEqual(newCiudad.name)
    expect(storedCiudad.country).toEqual(newCiudad.country)
    expect(storedCiudad.population).toEqual(newCiudad.population)
  });

  it('create should throw an exception for an invalid country', async () => {
    const ciudad: CiudadEntity = {
      id: "",
      name: faker.location.city(), 
      country: "Invalid Country",
      population: faker.number.int({ min: 10, max:10000000 }),
      supermercados: []
    }

    await expect(() => service.create(ciudad)).rejects.toHaveProperty("message", "The country is not allowed");
  });

  it('update should modify a city', async () => {
    const ciudad: CiudadEntity = ciudadesList[0];
    const randomCountry = allowedCountries[Math.floor(Math.random() * allowedCountries.length)];
    ciudad.name = "New city";
    ciudad.country = randomCountry;
  
    const updateCiudad: CiudadEntity = await service.update(ciudad.id, ciudad);
    expect(updateCiudad).not.toBeNull();
  
    const storedCiudad: CiudadEntity = await repository.findOne({ where: { id: ciudad.id } })
    expect(storedCiudad).not.toBeNull();
    expect(storedCiudad.name).toEqual(ciudad.name)
    expect(storedCiudad.country).toEqual(ciudad.country)
  });

  it('update should throw an exception for an invalid city', async () => {
    let ciudad: CiudadEntity = ciudadesList[0];
    ciudad = {
      ...ciudad, name: "New city", country: "New country"
    }
    await expect(() => service.update("0", ciudad)).rejects.toHaveProperty("message", "The city with the given id was not found")
  });

  it('update should throw an exception for an invalid country', async () => {
    const ciudad: CiudadEntity = ciudadesList[0];
    ciudad.country = "Invalid Country";

    await expect(() => service.update(ciudad.id, ciudad)).rejects.toHaveProperty("message", "The country is not allowed");
  });

  it('delete should remove a city', async () => {
    const ciudad: CiudadEntity = ciudadesList[0];
    await service.delete(ciudad.id);
  
    const deletedCiudad: CiudadEntity = await repository.findOne({ where: { id: ciudad.id } })
    expect(deletedCiudad).toBeNull();
  });

  it('delete should throw an exception for an invalid city', async () => {
    const ciudad: CiudadEntity = ciudadesList[0];
    await service.delete(ciudad.id);
    await expect(() => service.delete("0")).rejects.toHaveProperty("message", "The city with the given id was not found")
  });
});