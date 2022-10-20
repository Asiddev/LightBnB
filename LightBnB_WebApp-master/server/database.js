/* eslint-disable no-unused-vars */
const { Pool } = require("pg");

const pool = new Pool({
  user: "alexsidor",
  password: "123",
  host: "localhost",
  database: "lightbnb",
});

/// Users
// pool
//   .query(
//     `SELECT * FROM users
// WHERE email = 'gabriellaporter@outlook.com';`
//   )
//   .then((response) => {
//     console.log(response.rows);
//   });

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  return pool
    .query(
      `SELECT * FROM users
     WHERE email = $1;`,
      [email]
    )
    .then((result) => {
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  return pool
    .query(
      `SELECT * FROM users
   WHERE id = $1;`,
      [id]
    )
    .then((result) => {
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.getUserWithId = getUserWithId;

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  const { name, email, password } = user;
  console.log(name, email, password);
  return pool
    .query(
      `
  INSERT INTO users (name, email, password)
  VALUES ($1, $2, $3)
  RETURNING *;
  `,
      //VALUES
      [name, email, password]
    )
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  return pool
    .query(
      `
  SELECT 
    properties.*,
    reservations.*,
    avg(property_reviews.rating) AS average_rating
  FROM reservations
  JOIN properties ON properties.id = reservations.property_id
  JOIN property_reviews ON properties.id = property_reviews.property_id
  WHERE reservations.guest_id = $1 AND end_date > start_date
  GROUP BY properties.id, reservations.id
  ORDER BY reservations.start_date
  LIMIT $2;
`,
      [guest_id, limit]
    )
    .then((result) => result.rows)
    .catch((err) => {
      console.log(err.message);
      return null;
    });
};
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function (options, limit = 10) {
  // 1
  const queryParams = [];

  // 2
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  if (options.owner_id) {
    queryString += `WHERE properties.owner_id = ${options.owner_id}`;
  }

  console.log(options);

  // 3

  if (options.city) {
    queryString += `WHERE `;
    queryParams.push(`%${options.city}%`);
    queryString += `city ILIKE $${queryParams.length} `;

    if (options.minimum_price_per_night && options.maximum_price_per_night) {
      queryParams.push(`${options.minimum_price_per_night}`);
      queryString += `AND cost_per_night > $${queryParams.length} * 100 `;
      queryParams.push(`${options.maximum_price_per_night}`);
      queryString += `AND cost_per_night < $${queryParams.length} * 100`;
    } else {
      if (options.minimum_price_per_night) {
        queryParams.push(`${options.minimum_price_per_night}`);
        queryString += `AND cost_per_night >= $${queryParams.length} * 100`;
      }
      if (options.maximum_price_per_night) {
        queryParams.push(`${options.maximum_price_per_night}`);
        queryString += `AND cost_per_night <= $${queryParams.length} * 100`;
      }
    }
  } else {
    if (options.minimum_price_per_night && options.maximum_price_per_night) {
      queryParams.push(`${options.minimum_price_per_night}`);
      queryString += `WHERE cost_per_night > $${queryParams.length} * 100 `;
      queryParams.push(`${options.maximum_price_per_night}`);
      queryString += `AND cost_per_night < $${queryParams.length} * 100`;
    } else {
      if (options.minimum_price_per_night) {
        queryParams.push(`${options.minimum_price_per_night}`);
        queryString += `WHERE cost_per_night >= $${queryParams.length} * 100`;
      }
      if (options.maximum_price_per_night) {
        queryParams.push(`${options.maximum_price_per_night}`);
        queryString += `WHERE cost_per_night <= $${queryParams.length} * 100`;
      }
    }
  }

  if (options.minimum_rating) {
    queryString += `
    GROUP BY properties.id, rating`;
    queryParams.push(`${options.minimum_rating}`);
    queryString += `
    HAVING rating >= $${queryParams.length}`;
    queryParams.push(limit);
    queryString += `
    ORDER BY cost_per_night
    LIMIT $${queryParams.length};
    `;
  } else {
    queryParams.push(limit);
    queryString += `
    GROUP BY properties.id
    ORDER BY cost_per_night
    LIMIT $${queryParams.length};
    `;
  }

  console.log(queryString, queryParams);

  // 6
  return pool.query(queryString, queryParams).then((res) => res.rows);
};
exports.getAllProperties = getAllProperties;

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  let {
    owner_id,
    title,
    description,
    thumbnail_photo_url,
    cover_photo_url,
    cost_per_night,
    street,
    city,
    province,
    post_code,
    country,
    parking_spaces,
    number_of_bathrooms,
    number_of_bedrooms,
  } = property;

  console.log(property);

  return pool
    .query(
      `
  INSERT INTO properties (owner_id,
    title,
    description,
    thumbnail_photo_url,
    cover_photo_url,
    cost_per_night,
    street,
    city,
    province,
    post_code,
    country,
    parking_spaces,
    number_of_bathrooms,
    number_of_bedrooms)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
  RETURNING *;
  `,
      //VALUES
      [
        owner_id,
        title,
        description,
        thumbnail_photo_url,
        cover_photo_url,
        cost_per_night,
        street,
        city,
        province,
        post_code,
        country,
        parking_spaces,
        number_of_bathrooms,
        number_of_bedrooms,
      ]
    )
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.addProperty = addProperty;
