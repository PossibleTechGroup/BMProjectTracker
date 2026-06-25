import * as bugModel from '../models/bug.js';

export function getByPlatform(platformId) {
  return bugModel.findByPlatform(platformId);
}

export function getByProject(projectId) {
  return bugModel.findByProject(projectId);
}

export function create(data, userId, userName) {
  return bugModel.create({ ...data, reportedById: userId, createdBy: userName, updatedBy: userName });
}

export function update(id, data) {
  return bugModel.update(id, data);
}

export function remove(id) {
  return bugModel.remove(id);
}
