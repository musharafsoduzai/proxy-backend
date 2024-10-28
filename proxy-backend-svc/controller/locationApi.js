import { client } from "../config/db.js";
import { insert, update } from "../config/dynamicQuery.js";
import moment from "moment";
const promise = client.promise();
const BaseUrl = process.env.BASE_URL;

export default {

  addLocation : async (req, res) => {
        const { name, parentid = null, sublocations = [] } = req.body;

        if (!name) {
          return res.status(400).send({ message: "location name is required", success: false });
        }
      
        try {

          await promise.query("START TRANSACTION");
      
          const insertLocationQuery = `
            INSERT INTO location (name, parentid)
            VALUES (?, ?)
          `;
          const [locationRes] = await promise.query(insertLocationQuery, [
            name,
           
            parentid,
          ]);
      
          const locationId = locationRes.insertId; 
          const addSublocations = async (sublocations, parentId) => {
            for (const subcategory of sublocations) {
              const {
                name: subName,
                sublocations: nestedSublocations = [],
              } = subcategory;
      
              const [sublocationRes] = await promise.query(insertLocationQuery, [
                subName,
                parentId,
              ]);
      
              const sublocationId = sublocationRes.insertId;
      
              if (nestedSublocations.length > 0) {
                await addSublocations(nestedSublocations, sublocationId);
              }
            }
          };
      
          if (sublocations.length > 0) {
            await addSublocations(sublocations, locationId);
          }
      
          await promise.query("COMMIT");
          return res.status(201).send({
            message: "Added successfully",
            success: true,
            locationId: locationId,
          });
        } catch (error) {
          await promise.query("ROLLBACK");
          console.error(`Error in addCategory: ${error}`);
          return res.status(500).send({ message: error.message, success: false });
        }
  },

  getOneLoction: async (req, res) => {
    try {
      const query = `SELECT * FROM location WHERE id = ?`;
      const [category] = await promise.query(query, [req.params.id]);
      if (!category[0]) {
        return res
          .status(404)
          .send({ message: "no record found", success: false, data: [] });
      } else {
        return res.status(200).send({
          message: "record fetched",
          success: true,
          data: category[0],
        });
      }
    } catch (error) {
      console.log(`Error : ${error}`);
      return res.status(500).send({ message: error?.message, success: false });
    }
  },

  getAllLocation: async (req, res) => {
    try {
        const fetchLocationsWithSublocations = async (parentId = null) => {
            const getLocationsQuery = `
            SELECT *
            FROM location
            WHERE parentid ${parentId ? "= ?" : "IS NULL"}
            ORDER BY createdAt DESC
          `;
          const [locations] = await promise.query(getLocationsQuery, parentId ? [parentId] : []);
          for (const location of locations) {
            location.sublocations = await fetchLocationsWithSublocations(location.id);
          }
    
          return locations;
        };
        const locations = await fetchLocationsWithSublocations();
        return res.status(200).send({
          success: true,
          message: "locations fetched successfully",
          locations: locations,
        });
      } catch (error) {
        console.error(`Error in getAlllocations: ${error}`);
        return res.status(500).send({ message: error.message, success: false });
      }
  },

  updateLocation: async (req, res) => {
    try {
        const result = await update(req.body, req.params.id);
        const updateQuery = `UPDATE location SET ${result.setClause} WHERE id = ?`;
        const [updateRes] = await promise.query(
          updateQuery,
          result.queryParams,
        );
        if (updateRes.affectedRows > 0) {
          return res
            .status(201)
            .send({ message: "Record updated", success: true });
        } else {
          return res
            .status(404)
            .send({ message: "record not found", success: false });
        }
  
    } catch (error) {
      console.log(`Error : ${error}`);
      return res.status(500).send({ message: error?.message, success: false });
    }
  },

  deleteLocation: async (req, res) => {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send({ message: "location ID is required", success: false });
    }
  
    try {
      const deleteCategoryAndSubcategories = async (locationId) => {
        const getSubcategoriesQuery = `SELECT id FROM location WHERE parentid = ?`;
        const [subcategories] = await promise.query(getSubcategoriesQuery, [locationId]);
        for (const subcategory of subcategories) {
          await deleteCategoryAndSubcategories(subcategory.id);
        }
        const deleteQuery = `DELETE FROM location WHERE id = ?`;
        await promise.query(deleteQuery, [locationId]);
      };
  
      await deleteCategoryAndSubcategories(id);
  
      return res.status(200).send({ message: "deleted successfully", success: true });
    } catch (error) {
      console.error(`Error in deleteCategory: ${error}`);
      return res.status(500).send({ message: error.message, success: false });
    }
  },
  // deleteCategory: async (req, res) => {
  //   try {
  //       const { id } = req.params;
  //       const deleteQuery = "DELETE FROM category WHERE id = ?";
  //       const [deleteRes] = await promise.query(deleteQuery, [id]);
    
  //       if (deleteRes.affectedRows > 0) {
  //         return res
  //           .status(200)
  //           .send({ message: "Record deleted successfully", success: true });
  //       } else {
  //         return res
  //           .status(404)
  //           .send({ message: "Record not found", success: false });
  //       }
  //     } catch (error) {
  //       console.error(`Error ${error}`);
  //       return res.status(500).send({ message: error.message, success: false });
  //     }
  // },
};
