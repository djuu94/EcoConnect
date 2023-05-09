const { Router } = require("express");
const router = Router();

const Organizations = require("../models/organizations.model");

router.get("/", async (req, res) => {
  try {
    const organizations = await Organizations.find();
    res.json(organizations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router
  .route("/:id")
  .get(getOrganization, (req, res) => {
    res.json(res.organization);
  })
  .patch(getOrganization, async (req, res) => {
    const { organization } = res;
    const { id, name, description, mission, category, links } = req.body;
    if (id != null) organization.id = id;
    if (name != null) organization.name = name;
    if (description != null) organization.description = description;
    if (mission != null) organization.mission = mission;
    if (category != null) organization.category = category;
    if (links != null) organization.links = links;
    try {
      const updatedOrganization = await organization.save();
      res.json(updatedOrganization);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  })
  .delete(getOrganization, async (req, res) => {
    try {
      await res.organization.remove();
      res.json({ message: "Deleted organization" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

router.post("/add", async (req, res) => {
  const { id, name, description, mission, category, links } = req.body;
  const organization = new Organizations({
    id,
    name,
    description,
    mission,
    category,
    links,
  });
  try {
    const newOrganization = await organization.save();
    res.status(201).json(newOrganization);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

async function getOrganization(req, res, next) {
  try {
    const organization = await Organizations.findById(req.params.id);
    if (!organization) {
      return res.status(404).json({ message: "Cannot find organization" });
    }
    res.organization = organization;
    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

module.exports = router;
