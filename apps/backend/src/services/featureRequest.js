import * as featureRequestModel from '../models/featureRequest.js';

export function getByPlatform(platformId) {
  return featureRequestModel.findByPlatform(platformId);
}

export function create(data, userId, userName) {
  return featureRequestModel.create({ ...data, requestedById: userId, createdBy: userName, updatedBy: userName });
}

export function update(id, data) {
  return featureRequestModel.update(id, data);
}

export function remove(id) {
  return featureRequestModel.remove(id);
}
